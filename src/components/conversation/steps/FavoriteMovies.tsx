import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { X, ChevronLeft } from 'lucide-react';
import { MovieSearch } from '../../ui/MovieSearch';
import type { MovieSearchResult } from '../../../lib/tmdb';

interface Props {
  genres: string[];
  onSelect: (favorites: string[]) => void;
  onBack: () => void;
  showBackButton: boolean;
}

interface FavoriteMovie {
  id: number;
  title: string;
  year: number;
  posterUrl: string | null;
}

export function FavoriteMovies({ genres, onSelect, onBack, showBackButton }: Props) {
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAddFavorite = (movie: MovieSearchResult) => {
    if (favorites.length >= 3) {
      setError('You can only add up to 3 favorite movies');
      return;
    }

    if (favorites.some(f => f.id === movie.id)) {
      setError('This movie is already in your favorites');
      return;
    }

    setFavorites(prev => [...prev, {
      id: movie.id,
      title: movie.title,
      year: movie.year,
      posterUrl: movie.posterPath
    }]);
    setError(null);
  };

  const handleRemoveFavorite = (movieId: number) => {
    setFavorites(prev => prev.filter(m => m.id !== movieId));
    setError(null);
  };

  const handleSubmit = () => {
    if (favorites.length === 0) {
      setError('Please add at least one favorite movie');
      return;
    }
    onSelect(favorites.map(f => f.title));
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          What are some movies you've enjoyed in these genres?
        </h2>
        <p className="text-gray-600">
          Add up to 3 movies that you loved watching.
        </p>
      </div>

      <div className="space-y-4">
        <MovieSearch
          onSelect={handleAddFavorite}
          placeholder="Search for a movie you enjoyed..."
        />

        <div className="space-y-2">
          {favorites.map((movie) => (
            <div
              key={movie.id}
              className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg"
            >
              <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{movie.title}</div>
                <div className="text-sm text-gray-600">{movie.year}</div>
              </div>
              <button
                onClick={() => handleRemoveFavorite(movie.id)}
                className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-indigo-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={onBack}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg text-gray-600 font-medium",
              "hover:bg-gray-100 transition-colors duration-200"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
            Back
          </button>
        )}
        <button
          onClick={handleSubmit}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg text-white font-medium",
            "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            "transition-colors duration-200"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}