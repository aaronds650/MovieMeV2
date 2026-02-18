import { Pool } from 'pg';
import { authenticateRequest } from './auth.js';
import { ensureProfileExists } from './helpers/profileSync.js';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const query = (text, params) => pool.query(text, params);

// Generate UUID
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Structured error logging
const logError = (endpoint, userId, errorCode, errorMessage, details = {}) => {
  const shortUserId = userId ? userId.substring(0, 8) : 'unknown';
  console.error(`[${endpoint}] user:${shortUserId} error:${errorCode} ${errorMessage}`, details);
};

export default async function handler(req, res) {
  // Environment guard
  if (!process.env.DATABASE_URL) {
    logError('watched', null, 'CONFIG_ERROR', 'DATABASE_URL not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Authenticate user
      const auth = await authenticateRequest(req);
      if (!auth.authenticated) {
        logError('watched-get', null, 'AUTH_FAILED', auth.error);
        return res.status(401).json({ error: auth.error });
      }

      const { tmdb_id } = req.query;
      const userId = auth.userId;

      // Ensure profile exists in Neon
      await ensureProfileExists(userId, auth.user);

      if (tmdb_id) {
        // Check if specific movie is watched
        const result = await query(
          `SELECT COUNT(*) as count FROM watched_movies WHERE user_id = $1 AND tmdb_id = $2`,
          [userId, parseInt(tmdb_id)]
        );
        return res.json({ exists: parseInt(result.rows[0].count) > 0 });
      } else {
        // Get full watched list
        const result = await query(
          `SELECT * FROM watched_movies WHERE user_id = $1 ORDER BY watched_at DESC`,
          [userId]
        );
        return res.json(result.rows);
      }
    }

    if (req.method === 'POST') {
      // Authenticate user
      const auth = await authenticateRequest(req);
      if (!auth.authenticated) {
        logError('watched-post', null, 'AUTH_FAILED', auth.error);
        return res.status(401).json({ error: auth.error });
      }

      const { action, movieData, tmdb_id } = req.body;
      const userId = auth.userId;

      // Ensure profile exists in Neon
      await ensureProfileExists(userId, auth.user);

      if (action === 'add') {
        if (!movieData) {
          logError('watched-add', userId, 'VALIDATION_ERROR', 'movieData required');
          return res.status(400).json({ error: 'movieData required' });
        }

        // Check if already watched
        const checkResult = await query(
          `SELECT COUNT(*) as count FROM watched_movies WHERE user_id = $1 AND tmdb_id = $2`,
          [userId, movieData.tmdb_id]
        );

        if (parseInt(checkResult.rows[0].count) > 0) {
          logError('watched-add', userId, 'DUPLICATE_ENTRY', 'Movie already watched');
          return res.status(409).json({ error: 'Movie already watched' });
        }

        // Remove from watchlist first
        await query(
          `DELETE FROM watchlist WHERE user_id = $1 AND tmdb_id = $2`,
          [userId, movieData.tmdb_id]
        ).catch(() => {}); // Ignore if not in watchlist

        // Add to watched movies
        const id = generateId();
        const result = await query(
          `INSERT INTO watched_movies (id, user_id, tmdb_id, title, year, poster_url, overview, rating, review)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [id, userId, movieData.tmdb_id, movieData.title, movieData.year, 
           movieData.poster_url, movieData.overview, movieData.rating, movieData.review]
        );
        
        return res.json(result.rows[0]);
      }

      if (action === 'remove') {
        if (!tmdb_id) {
          logError('watched-remove', userId, 'VALIDATION_ERROR', 'tmdb_id required');
          return res.status(400).json({ error: 'tmdb_id required' });
        }

        await query(
          `DELETE FROM watched_movies WHERE user_id = $1 AND tmdb_id = $2`,
          [userId, tmdb_id]
        );
        
        return res.json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    const userId = req.body?.userId || req.query?.userId;
    
    if (error.code === '23505') {
      logError('watched', userId, 'DUPLICATE_ENTRY', 'Movie already watched', { code: error.code });
      return res.status(409).json({ error: 'Movie already watched' });
    }
    
    logError('watched', userId, error.code || 'INTERNAL_ERROR', error.message, { 
      stack: error.stack,
      method: req.method 
    });
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}