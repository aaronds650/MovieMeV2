// JWT verification utilities for Supabase auth
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for JWT verification
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For JWT verification, we don't need the service key, just the anon key
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Extract token from Authorization header
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Verify JWT token and get user
export async function verifyAuthToken(token) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { success: false, error: error?.message || 'Invalid token' };
    }

    return { success: true, userId: user.id, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Middleware-style auth checker for API routes
export async function authenticateRequest(req) {
  const authHeader = req.headers.authorization;
  const token = extractBearerToken(authHeader);
  
  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }

  const verification = await verifyAuthToken(token);
  if (!verification.success) {
    return { authenticated: false, error: verification.error };
  }

  return {
    authenticated: true,
    userId: verification.userId,
    user: verification.user
  };
}