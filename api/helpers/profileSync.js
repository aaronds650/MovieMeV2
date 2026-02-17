import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Ensures a profile exists in Neon for the given Supabase user ID
 * Creates one if it doesn't exist
 */
export async function ensureProfileExists(userId, userEmail = null) {
  try {
    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT id FROM profiles WHERE id = $1',
      [userId]
    );

    if (existingProfile.rows.length > 0) {
      // Profile exists, return success
      return { success: true, created: false };
    }

    // Profile doesn't exist, create it
    const username = userEmail 
      ? `user_${userEmail.split('@')[0]}_${userId.substring(0, 8)}`
      : `user_${userId.substring(0, 8)}`;

    await pool.query(
      'INSERT INTO profiles (id, username, role) VALUES ($1, $2, $3)',
      [userId, username, 'core']
    );

    console.log(`Auto-created profile for Supabase user ${userId}`);
    return { success: true, created: true };

  } catch (error) {
    console.error('Profile sync error:', error);
    
    // If it's a unique constraint violation, profile was created by another request
    if (error.code === '23505') {
      return { success: true, created: false };
    }
    
    throw error;
  }
}