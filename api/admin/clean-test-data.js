import { cleanTestData } from '../clean-test-data.js';

export default async function handler(req, res) {
  // Basic security check - this should be removed after use
  const authHeader = req.headers.authorization;
  if (authHeader !== 'Bearer cleanup-admin-2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧹 Starting admin cleanup via API endpoint...');
    
    const results = await cleanTestData();
    
    console.log('✅ Cleanup completed successfully via API');
    
    return res.json({
      success: true,
      message: 'Test data cleanup completed successfully',
      results: {
        deletedProfiles: results.deletedProfiles,
        deletedWatchlist: results.deletedWatchlist,
        deletedWatched: results.deletedWatched,
        deletedLimits: results.deletedLimits,
        deletedActivity: results.deletedActivity,
        deletedStreaming: results.deletedStreaming,
        remainingUsers: results.remainingUsers
      }
    });

  } catch (error) {
    console.error('❌ Admin cleanup failed:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Cleanup failed',
      message: error.message
    });
  }
}