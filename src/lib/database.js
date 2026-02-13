import { Pool } from 'pg';

// Create PostgreSQL connection pool for Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1, // Serverless: 1 connection per function
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query helper function
export const query = (text, params) => pool.query(text, params);

// Generate UUID for new records
export const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

console.log('✅ PostgreSQL connection pool initialized');

export default pool;