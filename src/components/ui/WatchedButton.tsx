import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { markAsWatched, removeFromWatched, isWatched } from '../../lib/supabase';

interface Props {
  tmdbId: number;
  title: string;
  year: number;
  posterUrl: string | null;
  overview: string;
  className?: string;
}

export function WatchedButton({
  tmdbId,
  title,
  year,
  posterUrl,
  overview,
  className
}: Props) {
  const [isMarkedWatched, setIsMarkedWatched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkWatchedStatus();
  }, [tmdbId]);

  const checkWatchedStatus = async () => {
    try {
      const status = await isWatched(tmdbId);
      setIsMarkedWatched(status);
    } catch (err) {
      console.error('Error checking watched status:', err);
    }
  };

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      if (isMarkedWatched) {
        await removeFromWatched(tmdbId);
        setIsMarkedWatched(false);
      } else {
        const result = await markAsWatched({
          tmdb_id: tmdbId,
          title,
          year,
          poster_url: posterUrl,
          overview
        });
        if (result !== null) {
          setIsMarkedWatched(true);
        } else {
          // Movie already watched (409 conflict)
          setIsMarkedWatched(true);
        }
      }
    } catch (err) {
      console.error('Error updating watched status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update watched status');
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
          "hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
          isMarkedWatched && "text-green-500 hover:text-green-600 bg-green-50",
          !isMarkedWatched && "text-gray-400 hover:text-green-500",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        title={isMarkedWatched ? "Mark as unwatched" : "Mark as watched"}
      >
        <Check className={cn(
          "h-6 w-6 transition-transform duration-200",
          isMarkedWatched && "scale-110",
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