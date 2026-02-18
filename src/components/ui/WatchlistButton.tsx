import React, { useState, useEffect } from 'react';
import { Popcorn } from 'lucide-react';
import { cn } from '../../lib/utils';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '../../lib/supabase';

interface Props {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
  overview: string;
  className?: string;
}

export function WatchlistButton({
  tmdbId,
  title,
  year,
  posterUrl,
  overview,
  className
}: Props) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWatchlistStatus();
  }, [tmdbId]);

  const checkWatchlistStatus = async () => {
    try {
      const status = await isInWatchlist(tmdbId);
      setIsWatchlisted(status);
    } catch (err) {
      console.error('Error checking watchlist status:', err);
    }
  };

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      if (isWatchlisted) {
        await removeFromWatchlist(tmdbId);
        setIsWatchlisted(false);
      } else {
        const result = await addToWatchlist({
          tmdb_id: tmdbId,
          title,
          year,
          poster_url: posterUrl,
          overview
        });
        if (result !== null) {
          setIsWatchlisted(true);
        } else {
          // Movie already in watchlist (409 conflict)
          setIsWatchlisted(true);
        }
      }
    } catch (err) {
      console.error('Error updating watchlist:', err);
      if (err instanceof Error && err.message.includes('Authentication required')) {
        setError('Please sign in to add movies to your watchlist');
      } else if (err instanceof Error && err.message.includes('Network')) {
        setError('Connection issue. Please check your internet and try again');
      } else {
        setError('Unable to update watchlist. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "p-2 rounded-full transition-all duration-200",
          "hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2",
          isWatchlisted && "text-yellow-500 hover:text-yellow-600 bg-yellow-50",
          !isWatchlisted && "text-gray-400 hover:text-yellow-500",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
      >
        <Popcorn className={cn(
          "h-6 w-6 transition-transform duration-200",
          isWatchlisted && "scale-110",
          isLoading && "animate-pulse"
        )} />
      </button>
      {error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-red-50 text-red-600 text-xs rounded shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}