// Frontend compatibility layer - all database calls go through API endpoints

// Mock Supabase client structure for compatibility
export const supabase = {
  auth: {
    getUser: async () => {
      // For development, return mock user
      return {
        data: {
          user: {
            id: 'dev-user-1',
            email: 'dev@example.com'
          }
        },
        error: null
      };
    }
  }
};

// Frontend database functions - all calls go through API endpoints
export async function addToWatchlist(movieData: {
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string | null;
  overview: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const response = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        user_id: user.id,
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch('/api/watchlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'remove',
      user_id: user.id,
      tmdb_id: tmdbId
    })
  });

  if (!response.ok) throw new Error('Failed to remove from watchlist');
}

export async function isInWatchlist(tmdbId: number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const response = await fetch(`/api/watchlist?user_id=${user.id}&tmdb_id=${tmdbId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists;
  } catch (error: any) {
    return false;
  }
}

export async function getWatchlist() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const response = await fetch(`/api/watchlist?user_id=${user.id}`);
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const response = await fetch('/api/watched', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        user_id: user.id,
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch('/api/watched', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'remove',
      user_id: user.id,
      tmdb_id: tmdbId
    })
  });

  if (!response.ok) throw new Error('Failed to remove from watched');
}

export async function isWatched(tmdbId: number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  try {
    const response = await fetch(`/api/watched?user_id=${user.id}&tmdb_id=${tmdbId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists;
  } catch (error: any) {
    return false;
  }
}

export async function getWatchedMovies() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  try {
    const response = await fetch(`/api/watched?user_id=${user.id}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error: any) {
    return [];
  }
}