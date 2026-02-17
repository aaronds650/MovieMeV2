// Supabase authentication utilities
import { supabase, getCurrentUser, getCurrentUserId as getSupabaseUserId } from './supabaseClient';

// Get current user ID from Supabase session
export async function getCurrentUserId(): Promise<string | null> {
  return await getSupabaseUserId();
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Get current user object
export async function getUser() {
  return await getCurrentUser();
}

// Auth state listener
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
}