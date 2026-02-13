import React, { useState, useEffect, useRef } from 'react';
import { Popcorn, ChevronDown, Film, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { getWatchlist } from '../../lib/supabase';

interface WatchlistMovie {
  id: string;
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string | null;
  overview: string;
  created_at: string;
}

export function WatchlistDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [movies, setMovies] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadWatchlist();
    }
  }, [isOpen]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const watchlist = await getWatchlist();
      setMovies(watchlist);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium",
          "text-gray-700 hover:text-gray-900 transition-colors",
          isOpen && "text-indigo-600"
        )}
      >
        <Popcorn className="h-4 w-4" />
        Watchlist
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">My Watchlist</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600 text-sm">
                {error}
              </div>
            ) : movies.length > 0 ? (
              <>
                <div className="divide-y">
                  {movies.slice(0, 5).map((movie) => (
                    <div key={movie.id} className="p-4 hover:bg-gray-50">
                      <div className="flex gap-3">
                        <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          {movie.poster_url ? (
                            <img
                              src={movie.poster_url}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {movie.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {movie.year}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {movie.overview}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t">
                  <Link
                    to="/watchlist"
                    className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    View All {movies.length > 0 && `(${movies.length})`}
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <Film className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm mb-4">Your watchlist is empty</p>
                <Link
                  to="/watchlist"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View Watchlist
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}