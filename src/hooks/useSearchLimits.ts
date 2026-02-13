import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { SearchUsage } from '../lib/types';

const SEARCH_LIMITS = {
  core: 5,
  premium: 30
};

export function useSearchLimits() {
  const { session, userProfile } = useAuth();
  const [usage, setUsage] = useState<SearchUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    try {
      if (!session?.user) return;

      // Mock development usage - fetch from API endpoint
      const response = await fetch(`/api/search-usage/${session.user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.status}`);
      }

      const result = await response.json();
      const limit = userProfile?.role === 'premium' ? SEARCH_LIMITS.premium : SEARCH_LIMITS.core;
      
      setUsage({
        searchCount: result.search_count,
        lastReset: new Date(result.last_reset),
        remainingSearches: Math.max(0, limit - result.search_count)
      });
    } catch (err) {
      console.error('Error fetching search usage:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch search usage');
    } finally {
      setLoading(false);
    }
  };

  const incrementSearchCount = async () => {
    try {
      if (!session?.user || !usage) return false;

      const limit = userProfile?.role === 'premium' ? SEARCH_LIMITS.premium : SEARCH_LIMITS.core;
      
      if (usage.searchCount >= limit) {
        throw new Error(
          userProfile?.role === 'premium'
            ? "You've reached your daily search threshold. Please try again tomorrow."
            : "You've reached your daily search limit. Upgrade to get more recommendations!"
        );
      }

      // Increment via API endpoint
      const response = await fetch(`/api/search-usage/${session.user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: true })
      });

      if (!response.ok) {
        throw new Error(`Failed to update usage: ${response.status}`);
      }

      const data = await response.json();

      setUsage({
        ...usage,
        searchCount: data.search_count,
        remainingSearches: Math.max(0, limit - data.search_count)
      });

      return true;
    } catch (err) {
      console.error('Error incrementing search count:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUsage();
    }
  }, [session?.user, userProfile?.role]);

  return {
    usage,
    loading,
    error,
    incrementSearchCount,
    refreshUsage: fetchUsage
  };
}