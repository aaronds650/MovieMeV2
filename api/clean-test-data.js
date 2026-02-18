import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Clean legacy test data from Neon database
 * Keep only Supabase-authenticated users
 */
async function cleanTestData() {
  console.log('🧹 Starting test data cleanup...');
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    // Get current counts before cleanup
    const beforeCounts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM profiles'),
      pool.query('SELECT COUNT(*) FROM watchlist'),
      pool.query('SELECT COUNT(*) FROM watched_movies'),
      pool.query('SELECT COUNT(*) FROM user_search_limits'),
    ]);
    
    console.log('\n📊 Before cleanup:');
    console.log(`  Profiles: ${beforeCounts[0].rows[0].count}`);
    console.log(`  Watchlist: ${beforeCounts[1].rows[0].count}`);
    console.log(`  Watched movies: ${beforeCounts[2].rows[0].count}`);
    console.log(`  User search limits: ${beforeCounts[3].rows[0].count}`);
    
    // Identify legacy alpha/localStorage users
    // These are typically UUIDs that don't match Supabase auth patterns
    // We'll identify them by checking for profiles that have suspicious patterns:
    // 1. Usernames that start with 'user_' followed by UUID patterns
    // 2. No email addresses
    // 3. Generic usernames
    
    const legacyUsersQuery = await pool.query(`
      SELECT id, username, email, created_at
      FROM profiles 
      WHERE 
        (username ~ '^user_[a-f0-9]{8}$' OR 
         username ~ '^user_[a-f0-9-]{36}$' OR
         email IS NULL OR
         email = '' OR
         username ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$')
      ORDER BY created_at ASC
    `);
    
    const legacyUsers = legacyUsersQuery.rows;
    console.log(`\n🔍 Found ${legacyUsers.length} legacy test users to remove:`);
    
    if (legacyUsers.length === 0) {
      console.log('  No legacy users found. Database is clean!');
      await pool.query('ROLLBACK');
      return;
    }
    
    // Show which users will be deleted
    legacyUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. ${user.id} (${user.username || 'no username'}) - ${user.email || 'no email'}`);
    });
    
    const legacyUserIds = legacyUsers.map(u => u.id);
    
    // Delete related data for legacy users
    console.log('\n🗑️  Deleting related data...');
    
    // Delete user search limits
    const deletedLimits = await pool.query(
      'DELETE FROM user_search_limits WHERE user_id = ANY($1) RETURNING id',
      [legacyUserIds]
    );
    console.log(`  Deleted ${deletedLimits.rows.length} user search limit records`);
    
    // Delete watched movies
    const deletedWatched = await pool.query(
      'DELETE FROM watched_movies WHERE user_id = ANY($1) RETURNING id',
      [legacyUserIds]
    );
    console.log(`  Deleted ${deletedWatched.rows.length} watched movie records`);
    
    // Delete watchlist entries
    const deletedWatchlist = await pool.query(
      'DELETE FROM watchlist WHERE user_id = ANY($1) RETURNING id',
      [legacyUserIds]
    );
    console.log(`  Deleted ${deletedWatchlist.rows.length} watchlist records`);
    
    // Delete user activity log entries
    const deletedActivity = await pool.query(
      'DELETE FROM user_activity_log WHERE user_id = ANY($1) RETURNING id',
      [legacyUserIds]
    );
    console.log(`  Deleted ${deletedActivity.rows.length} activity log records`);
    
    // Delete user streaming services
    const deletedStreaming = await pool.query(
      'DELETE FROM user_streaming_services WHERE user_id = ANY($1) RETURNING user_id',
      [legacyUserIds]
    );
    console.log(`  Deleted ${deletedStreaming.rows.length} user streaming service records`);
    
    // Finally, delete the legacy profiles
    const deletedProfiles = await pool.query(
      'DELETE FROM profiles WHERE id = ANY($1) RETURNING id',
      [legacyUserIds]
    );
    console.log(`  Deleted ${deletedProfiles.rows.length} legacy profile records`);
    
    // Get counts after cleanup
    const afterCounts = await Promise.all([
      pool.query('SELECT COUNT(*) FROM profiles'),
      pool.query('SELECT COUNT(*) FROM watchlist'),
      pool.query('SELECT COUNT(*) FROM watched_movies'),
      pool.query('SELECT COUNT(*) FROM user_search_limits'),
    ]);
    
    console.log('\n📊 After cleanup:');
    console.log(`  Profiles: ${afterCounts[0].rows[0].count}`);
    console.log(`  Watchlist: ${afterCounts[1].rows[0].count}`);
    console.log(`  Watched movies: ${afterCounts[2].rows[0].count}`);
    console.log(`  User search limits: ${afterCounts[3].rows[0].count}`);
    
    // Show remaining users (should be Supabase users only)
    const remainingUsers = await pool.query(`
      SELECT id, username, email, role, created_at
      FROM profiles 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log('\n✅ Remaining users (Supabase-authenticated):');
    if (remainingUsers.rows.length === 0) {
      console.log('  No users remaining');
    } else {
      remainingUsers.rows.forEach((user, idx) => {
        const emailDisplay = user.email || 'no email';
        const usernameDisplay = user.username || 'no username';
        console.log(`  ${idx + 1}. ${user.id.substring(0, 8)}... (${usernameDisplay}) - ${emailDisplay}`);
      });
    }
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log('\n✅ Test data cleanup completed successfully!');
    
    return {
      deletedProfiles: deletedProfiles.rows.length,
      deletedWatchlist: deletedWatchlist.rows.length,
      deletedWatched: deletedWatched.rows.length,
      deletedLimits: deletedLimits.rows.length,
      deletedActivity: deletedActivity.rows.length,
      deletedStreaming: deletedStreaming.rows.length,
      remainingUsers: afterCounts[0].rows[0].count
    };
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run cleanup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  cleanTestData()
    .then((results) => {
      console.log('\n🎉 Cleanup Summary:');
      console.log(`  Profiles deleted: ${results.deletedProfiles}`);
      console.log(`  Watchlist entries deleted: ${results.deletedWatchlist}`);
      console.log(`  Watched movies deleted: ${results.deletedWatched}`);
      console.log(`  Search limits deleted: ${results.deletedLimits}`);
      console.log(`  Activity logs deleted: ${results.deletedActivity}`);
      console.log(`  Streaming services deleted: ${results.deletedStreaming}`);
      console.log(`  Users remaining: ${results.remainingUsers}`);
    })
    .catch((error) => {
      console.error('Failed to clean test data:', error);
      process.exit(1);
    })
    .finally(() => {
      pool.end();
    });
}

export { cleanTestData };