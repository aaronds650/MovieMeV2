import React, { useState, useRef, useEffect } from 'react';
import { Film, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { debouncedSearchMovies, type MovieSearchResult } from '../../lib/tmdb';

interface Props {
  onSelect: (movie: MovieSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function MovieSearch({ onSelect, placeholder = 'Search for a movie...', className }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (searchQuery: string) => {
    setQuery(searchQuery);
    setError(null);

    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    try {
      const searchResults = await debouncedSearchMovies(searchQuery);
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search movies. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (movie: MovieSearchResult) => {
    onSelect(movie);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setError(null);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-2 rounded-lg border",
            "focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            "placeholder:text-gray-400",
            error ? "border-red-300" : "border-gray-300"
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((movie) => (
                <li key={movie.id}>
                  <button
                    onClick={() => handleSelect(movie)}
                    className="w-full px-4 py-2 hover:bg-indigo-50 flex items-start gap-3 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 h-16 bg-gray-100 rounded overflow-hidden">
                      {movie.posterPath ? (
                        <img
                          src={movie.posterPath}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{movie.title}</div>
                      {movie.year > 0 && (
                        <div className="text-sm text-gray-500">{movie.year}</div>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {movie.overview}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.trim() ? (
            <div className="p-4 text-center text-gray-500">
              No movies found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}