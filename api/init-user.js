import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5
});

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    // Start transaction
    await pool.query('BEGIN');

    // Upsert profile
    await pool.query(`
      INSERT INTO profiles (id, username, role) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (id) DO NOTHING
    `, [user_id, 'Alpha User', 'core']);

    // Upsert search limits
    await pool.query(`
      INSERT INTO user_search_limits (user_id, searches_today, last_search_date) 
      VALUES ($1, 0, CURRENT_DATE) 
      ON CONFLICT (user_id) DO NOTHING
    `, [user_id]);

    await pool.query('COMMIT');

    console.log(`Initialized alpha user: ${user_id}`);
    
    res.json({ 
      success: true, 
      user_id,
      message: 'Alpha user initialized' 
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Init user error:', error);
    res.status(500).json({ error: 'Failed to initialize user' });
  }
}