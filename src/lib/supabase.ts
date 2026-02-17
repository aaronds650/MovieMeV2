// Frontend API layer - all database calls go through Neon API endpoints with JWT auth
import { getCurrentUserId, getAuthToken } from './supabaseClient';

// Helper to get authenticated headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Frontend database functions - all calls go through API endpoints
export async function addToWatchlist(movieData: {
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string | null;
  overview: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const response = await fetch('/api/watchlist', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        action: 'add',
        movieData
      })
    });

    if (!response.ok) {
      if (response.status === 409) return null; // Already exists
      if (response.status === 401) throw new Error('Authentication required');
      throw new Error('Failed to add to watchlist');
    }
    return await response.json();
  } catch (error: any) {
    if (error.message.includes('unique')) {
      return null;
    }
    throw error;
  }
}

export async function removeFromWatchlist(tmdbId: number) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      action: 'remove',
      tmdb_id: tmdbId
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Authentication required');
    throw new Error('Failed to remove from watchlist');
  }
}

export async function isInWatchlist(tmdbId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const token = await getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`/api/watchlist?tmdb_id=${tmdbId}`, { headers });
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists;
  } catch (error: any) {
    return false;
  }
}

export async function getWatchlist() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const token = await getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`/api/watchlist`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch (error: any) {
    return [];
  }
}

export async function markAsWatched(movieData: {
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string | null;
  overview: string;
  rating?: number;
  review?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const response = await fetch('/api/watched', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        action: 'add',
        movieData
      })
    });

    if (!response.ok) {
      if (response.status === 409) return null; // Already exists
      if (response.status === 401) throw new Error('Authentication required');
      throw new Error('Failed to mark as watched');
    }
    return await response.json();
  } catch (error: any) {
    if (error.message.includes('unique')) {
      return null;
    }
    throw error;
  }
}

export async function removeFromWatched(tmdbId: number) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await fetch('/api/watched', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      action: 'remove',
      tmdb_id: tmdbId
    })
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('Authentication required');
    throw new Error('Failed to remove from watched');
  }
}

export async function isWatched(tmdbId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  try {
    const token = await getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`/api/watched?tmdb_id=${tmdbId}`, { headers });
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists;
  } catch (error: any) {
    return false;
  }
}

export async function getWatchedMovies() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const token = await getAuthToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const response = await fetch(`/api/watched`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch (error: any) {
    return [];
  }
}