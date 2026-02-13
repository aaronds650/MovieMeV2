import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Trash2, AlertCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getWatchlist, removeFromWatchlist } from '../../lib/supabase';
import { WatchedButton } from '../ui/WatchedButton';
import { MovieListControls } from '../ui/MovieListControls';
import { sortMovies, paginateMovies } from '../../lib/sorting';
import type { MovieListConfig } from '../../lib/types';

interface WatchlistMovie {
  id: string;
  tmdb_id: number;
  title: string;
  year: number;
  poster_url: string | null;
  overview: string;
  created_at: string;
}

export function WatchlistPage() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<WatchlistMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [listConfig, setListConfig] = useState<MovieListConfig>({
    sort: { field: 'added', order: 'desc' },
    pagination: { page: 1, perPage: 10, total: 0 }
  });

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const watchlist = await getWatchlist();
      setMovies(watchlist);
      setListConfig(prev => ({
        ...prev,
        pagination: { ...prev.pagination, total: watchlist.length }
      }));
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (tmdbId: number) => {
    try {
      setRemovingId(tmdbId);
      await removeFromWatchlist(tmdbId);
      setMovies(prev => {
        const updated = prev.filter(movie => movie.tmdb_id !== tmdbId);
        setListConfig(config => ({
          ...config,
          pagination: {
            ...config.pagination,
            total: updated.length,
            page: Math.min(
              config.pagination.page,
              Math.ceil(updated.length / config.pagination.perPage)
            )
          }
        }));
        return updated;
      });
    } catch (err) {
      console.error('Error removing from watchlist:', err);
      setError('Failed to remove movie from watchlist');
    } finally {
      setRemovingId(null);
    }
  };

  const sortedMovies = sortMovies(movies, listConfig.sort);
  const paginatedMovies = paginateMovies(
    sortedMovies,
    listConfig.pagination.page,
    listConfig.pagination.perPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="py-6 px-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-indigo-600">My Watchlist</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/conversation')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Get Recommendations
            </button>
            <button
              onClick={() => navigate('/watched')}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Watched Movies
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        {error && (
          <div className="mb-8 p-4 bg-red-50 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {movies.length > 0 ? (
          <>
            <MovieListControls
              sort={listConfig.sort}
              pagination={listConfig.pagination}
              onSortChange={(field, order) => setListConfig(prev => ({
                ...prev,
                sort: { field, order }
              }))}
              onPageChange={page => setListConfig(prev => ({
                ...prev,
                pagination: { ...prev.pagination, page }
              }))}
              className="mb-6"
            />

            <div className="bg-white rounded-xl shadow-md divide-y">
              {paginatedMovies.map((movie) => (
                <div key={movie.id} className="p-6 flex gap-6">
                  <div className="w-24 h-36 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {movie.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {movie.title}
                        </h2>
                        <p className="text-gray-600">{movie.year}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <WatchedButton
                          tmdbId={movie.tmdb_id}
                          title={movie.title}
                          year={movie.year}
                          posterUrl={movie.poster_url}
                          overview={movie.overview}
                        />
                        <button
                          onClick={() => handleRemove(movie.tmdb_id)}
                          disabled={removingId === movie.tmdb_id}
                          className={cn(
                            "p-2 text-gray-400 hover:text-red-600 rounded-full",
                            "hover:bg-red-50 transition-colors",
                            removingId === movie.tmdb_id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-600">
                      {movie.overview}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Added on {new Date(movie.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Film className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Your watchlist is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start adding movies to your watchlist to keep track of what you want to watch.
            </p>
            <button
              onClick={() => navigate('/conversation')}
              className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Get Movie Recommendations
            </button>
          </div>
        )}
      </main>
    </div>
  );
}