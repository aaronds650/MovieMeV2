const { Pool } = require('pg');

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

module.exports = async (req, res) => {
  // Environment guard
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Check if movie is in watchlist OR get full watchlist
      const { user_id, tmdb_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({ error: 'user_id required' });
      }

      if (tmdb_id) {
        // Check if specific movie is in watchlist
        const result = await query(
          `SELECT COUNT(*) as count FROM watchlist WHERE user_id = $1 AND tmdb_id = $2`,
          [user_id, parseInt(tmdb_id)]
        );
        return res.json({ exists: parseInt(result.rows[0].count) > 0 });
      } else {
        // Get full watchlist
        const result = await query(
          `SELECT * FROM watchlist WHERE user_id = $1 ORDER BY created_at DESC`,
          [user_id]
        );
        return res.json(result.rows);
      }
    }

    if (req.method === 'POST') {
      const { action, user_id, movieData, tmdb_id } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: 'user_id required' });
      }

      if (action === 'add') {
        if (!movieData) {
          return res.status(400).json({ error: 'movieData required' });
        }

        const id = generateId();
        const result = await query(
          `INSERT INTO watchlist (id, user_id, tmdb_id, title, year, poster_url, overview)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [id, user_id, movieData.tmdb_id, movieData.title, movieData.year, 
           movieData.poster_url, movieData.overview]
        );
        
        return res.json(result.rows[0]);
      }

      if (action === 'remove') {
        if (!tmdb_id) {
          return res.status(400).json({ error: 'tmdb_id required' });
        }

        await query(
          `DELETE FROM watchlist WHERE user_id = $1 AND tmdb_id = $2`,
          [user_id, tmdb_id]
        );
        
        return res.json({ success: true });
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Watchlist API Error:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Movie already in watchlist' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};