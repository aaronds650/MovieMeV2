import { Pool } from 'pg';
import { authenticateRequest } from '../auth.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5 // Small pool for serverless
});

const SEARCH_LIMITS = {
  core: 5,
  premium: 30
};

// Rate limiting for rapid-fire protection
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 search count requests per minute

function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = rateLimitMap.get(userId) || [];
  
  // Remove old requests outside the window
  const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  
  return true; // Request allowed
}

export default async function handler(req, res) {
  // Environment guard
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Authenticate user
  const auth = await authenticateRequest(req);
  if (!auth.authenticated) {
    return res.status(401).json({ error: auth.error });
  }

  const { userId } = req.query;
  
  // Enforce user ID matches authenticated user (prevent bypassing via URL manipulation)
  if (userId !== auth.userId) {
    return res.status(403).json({ error: 'Access denied: User ID mismatch' });
  }

  // Rate limiting for rapid-fire abuse prevention
  if (!checkRateLimit(userId)) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a moment.' });
  }

  try {
    if (req.method === 'GET') {
      // Fetch current usage
      const result = await pool.query(
        'SELECT searches_today, last_search_date FROM user_search_limits WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        // Create new usage record
        await pool.query(
          'INSERT INTO user_search_limits (user_id, searches_today, last_search_date) VALUES ($1, 0, NOW())',
          [userId]
        );
        return res.json({
          search_count: 0,
          last_reset: new Date().toISOString()
        });
      }

      const usage = result.rows[0];
      const lastReset = new Date(usage.last_search_date);
      const now = new Date();
      const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceReset >= 1) {
        // Reset counter if it's been 24 hours
        await pool.query(
          'UPDATE user_search_limits SET searches_today = 0, last_search_date = NOW() WHERE user_id = $1',
          [userId]
        );
        return res.json({
          search_count: 0,
          last_reset: new Date().toISOString()
        });
      }

      return res.json({
        search_count: usage.searches_today,
        last_reset: usage.last_search_date
      });

    } else if (req.method === 'POST') {
      // Increment search count (tracking only, no limits enforced for launch validation)
      const { increment } = req.body;
      
      if (!increment) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Transaction-based increment to prevent race conditions
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get current usage with row lock to prevent concurrent updates
        let result = await client.query(
          'SELECT searches_today, last_search_date FROM user_search_limits WHERE user_id = $1 FOR UPDATE',
          [userId]
        );

        let currentCount = 0;
        let lastReset = new Date();

        if (result.rows.length === 0) {
          // Create new usage record
          await client.query(
            'INSERT INTO user_search_limits (user_id, searches_today, last_search_date) VALUES ($1, 0, NOW())',
            [userId]
          );
        } else {
          const usage = result.rows[0];
          lastReset = new Date(usage.last_search_date);
          currentCount = usage.searches_today;

          // Check if reset is needed (24 hour window)
          const now = new Date();
          const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

          if (hoursSinceReset >= 24) {
            // Reset counter
            await client.query(
              'UPDATE user_search_limits SET searches_today = 0, last_search_date = NOW() WHERE user_id = $1',
              [userId]
            );
            currentCount = 0;
            lastReset = new Date();
          }
        }

        // Increment with atomic operation (tracking only, no enforcement)
        const newCount = currentCount + 1;
        await client.query(
          'UPDATE user_search_limits SET searches_today = $1, last_search_date = COALESCE(last_search_date, NOW()) WHERE user_id = $2',
          [newCount, userId]
        );

        await client.query('COMMIT');

        return res.json({
          search_count: newCount,
          last_reset: lastReset
        });

      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Search usage API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}