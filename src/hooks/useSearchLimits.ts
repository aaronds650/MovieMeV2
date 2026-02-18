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
      
      setUsage({
        searchCount: result.search_count,
        lastReset: new Date(result.last_reset),
        remainingSearches: 999 // Always show available for launch validation
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

      // Increment via API endpoint (no limit enforcement for launch validation)
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
        remainingSearches: 999 // Always show available for launch validation
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