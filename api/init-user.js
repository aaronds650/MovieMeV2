import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5 // Small pool for serverless
});

export default async function handler(req, res) {
  // Environment guard
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

  // Validate that user_id is a UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    // Start a transaction
    await pool.query('BEGIN');

    // Upsert profile
    await pool.query(`
      INSERT INTO profiles (id, username, email, role, include_rentals) 
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
    `, [user_id, 'Alpha User', `alpha-${user_id.split('-')[0]}@example.com`, 'core', false]);

    // Upsert search limits
    await pool.query(`
      INSERT INTO user_search_limits (user_id, searches_today, last_search_date)
      VALUES ($1, 0, CURRENT_DATE)
      ON CONFLICT (user_id) DO NOTHING
    `, [user_id]);

    // Commit transaction
    await pool.query('COMMIT');

    console.log(`Initialized alpha user: ${user_id}`);
    
    return res.status(200).json({ 
      success: true,
      user_id: user_id,
      message: 'User initialized successfully'
    });

  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK');
    
    console.error('User initialization error:', error);
    return res.status(500).json({ error: 'Failed to initialize user' });
  }
}