import { sql } from '@vercel/postgres';

const SEARCH_LIMITS = {
  core: 5,
  premium: 30
};

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    if (req.method === 'GET') {
      // Fetch current usage
      const result = await sql`
        SELECT search_count, last_reset 
        FROM search_usage 
        WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        // Create new usage record
        await sql`
          INSERT INTO search_usage (user_id, search_count, last_reset) 
          VALUES (${userId}, 0, NOW())
        `;
        return res.json({
          search_count: 0,
          last_reset: new Date().toISOString()
        });
      }

      const usage = result.rows[0];
      const lastReset = new Date(usage.last_reset);
      const now = new Date();
      const daysSinceReset = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceReset >= 1) {
        // Reset counter if it's been 24 hours
        await sql`
          UPDATE search_usage 
          SET search_count = 0, last_reset = NOW() 
          WHERE user_id = ${userId}
        `;
        return res.json({
          search_count: 0,
          last_reset: new Date().toISOString()
        });
      }

      return res.json({
        search_count: usage.search_count,
        last_reset: usage.last_reset
      });

    } else if (req.method === 'POST') {
      // Increment search count
      const { increment } = req.body;
      
      if (!increment) {
        return res.status(400).json({ error: 'Invalid request' });
      }

      // Get current usage
      let result = await sql`
        SELECT search_count, last_reset 
        FROM search_usage 
        WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        // Create new usage record
        await sql`
          INSERT INTO search_usage (user_id, search_count, last_reset) 
          VALUES (${userId}, 1, NOW())
        `;
        return res.json({
          search_count: 1,
          last_reset: new Date().toISOString()
        });
      }

      const usage = result.rows[0];
      const newCount = usage.search_count + 1;

      // Update search count
      await sql`
        UPDATE search_usage 
        SET search_count = ${newCount} 
        WHERE user_id = ${userId}
      `;

      return res.json({
        search_count: newCount,
        last_reset: usage.last_reset
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Search usage API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}