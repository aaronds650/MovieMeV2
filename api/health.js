import { Pool } from 'pg';

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    checks: {}
  };

  try {
    // Test database connection
    console.log('Health check: Testing database connection...');
    const dbStart = Date.now();
    
    try {
      const result = await pool.query('SELECT NOW() as current_time, version()');
      const dbTime = Date.now() - dbStart;
      
      healthCheck.checks.db = {
        status: 'ok',
        responseTime: `${dbTime}ms`,
        timestamp: result.rows[0].current_time,
        version: result.rows[0].version.split(' ').slice(0, 2).join(' ') // Just "PostgreSQL X.X"
      };
      
      console.log(`Health check: Database OK (${dbTime}ms)`);
    } catch (dbError) {
      console.error('Health check: Database failed:', dbError.message);
      healthCheck.checks.db = {
        status: 'error',
        error: dbError.message,
        code: dbError.code || 'CONNECTION_ERROR'
      };
      healthCheck.status = 'degraded';
    }

    // Test OpenAI API key presence
    console.log('Health check: Checking OpenAI API key...');
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (openaiKey && openaiKey.startsWith('sk-') && openaiKey.length > 20) {
      healthCheck.checks.openai = {
        status: 'ok',
        keyPresent: true,
        keyFormat: 'valid'
      };
      console.log('Health check: OpenAI API key OK');
    } else {
      console.error('Health check: OpenAI API key missing or invalid format');
      healthCheck.checks.openai = {
        status: 'error',
        keyPresent: !!openaiKey,
        keyFormat: openaiKey ? 'invalid' : 'missing',
        error: 'OpenAI API key missing or invalid format'
      };
      healthCheck.status = 'degraded';
    }

    // Test Supabase configuration
    console.log('Health check: Checking Supabase configuration...');
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      healthCheck.checks.supabase = {
        status: 'ok',
        urlPresent: true,
        keyPresent: true
      };
      console.log('Health check: Supabase configuration OK');
    } else {
      console.error('Health check: Supabase configuration incomplete');
      healthCheck.checks.supabase = {
        status: 'error',
        urlPresent: !!supabaseUrl,
        keyPresent: !!supabaseKey,
        error: 'Supabase configuration incomplete'
      };
      healthCheck.status = 'degraded';
    }

    // Test TMDB API key
    console.log('Health check: Checking TMDB API key...');
    const tmdbKey = process.env.TMDB_API_KEY;
    
    if (tmdbKey && tmdbKey.length > 10) {
      healthCheck.checks.tmdb = {
        status: 'ok',
        keyPresent: true
      };
      console.log('Health check: TMDB API key OK');
    } else {
      console.error('Health check: TMDB API key missing');
      healthCheck.checks.tmdb = {
        status: 'error',
        keyPresent: !!tmdbKey,
        error: 'TMDB API key missing'
      };
      healthCheck.status = 'degraded';
    }

    // Overall status determination
    const hasErrors = Object.values(healthCheck.checks).some(check => check.status === 'error');
    if (hasErrors) {
      healthCheck.status = 'degraded';
    }

    // Return appropriate HTTP status
    const httpStatus = healthCheck.status === 'ok' ? 200 : 503;
    
    console.log(`Health check completed: ${healthCheck.status}`);
    return res.status(httpStatus).json(healthCheck);

  } catch (error) {
    console.error('Health check: Unexpected error:', error);
    
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: 'Health check failed',
      message: error.message
    });
  }
}