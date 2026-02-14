// Frontend API layer - all database calls go through Neon API endpoints
import { getCurrentUserId } from './auth';

// Frontend database functions - all calls go through API endpoints
export async function addToWatchlist(movieData: {
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string | null;
  overview: string;
}) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const response = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        user_id: userId,
        movieData
      })
    });

    if (!response.ok) throw new Error('Failed to add to watchlist');
    return await response.json();
  } catch (error: any) {
    if (error.message.includes('unique')) {
      return null;
    }
    throw error;
  }
}

export async function removeFromWatchlist(tmdbId: number) {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'remove',
      user_id: userId,
      tmdb_id: tmdbId
    })
  });

  if (!response.ok) throw new Error('Failed to remove from watchlist');
}

export async function isInWatchlist(tmdbId: number): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const response = await fetch(`/api/watchlist?user_id=${userId}&tmdb_id=${tmdbId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists;
  } catch (error: any) {
    return false;
  }
}

export async function getWatchlist() {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const response = await fetch(`/api/watchlist?user_id=${userId}`);
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
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const response = await fetch('/api/watched', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        user_id: userId,
        movieData
      })
    });

    if (!response.ok) {
      if (response.status === 409) return null; // Already exists
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
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  const response = await fetch('/api/watched', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'remove',
      user_id: userId,
      tmdb_id: tmdbId
    })
  });

  if (!response.ok) throw new Error('Failed to remove from watched');
}

export async function isWatched(tmdbId: number): Promise<boolean> {
  const userId = getCurrentUserId();
  if (!userId) return false;

  try {
    const response = await fetch(`/api/watched?user_id=${userId}&tmdb_id=${tmdbId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists;
  } catch (error: any) {
    return false;
  }
}

export async function getWatchedMovies() {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('User not authenticated');

  try {
    const response = await fetch(`/api/watched?user_id=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error: any) {
    return [];
  }
}