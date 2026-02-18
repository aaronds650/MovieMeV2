import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, ChevronRight, RefreshCw, Star, Film, User2, ChevronLeftCircle, AlertCircle, Popcorn, Check, Clock } from 'lucide-react';
import { getMovieRecommendations, type MovieRecommendation } from '../../../lib/openai';
import { WatchlistButton } from '../../ui/WatchlistButton';
import { WatchedButton } from '../../ui/WatchedButton';
import { useSearchLimits } from '../../../hooks/useSearchLimits';

interface Props {
  selections: {
    path: 'genre' | 'mood' | '';
    genres: string[];
    subgenres: string[];
    favorites: string[];
    moods: string[];
    acclaimed: string;
    timeframes: string[];
  };
  onReset: () => void;
  onBack: () => void;
  showBackButton: boolean;
}

const MOVIES_PER_BATCH = 5;
const MAX_RETRIES = 3;
const MAX_TOTAL_MOVIES = 15;

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function MovieRecommendations({ selections, onReset, onBack, showBackButton }: Props) {
  const { usage, loading: loadingUsage } = useSearchLimits();
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [noMoreAvailable, setNoMoreAvailable] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const recommendationsRef = useRef<MovieRecommendation[]>([]);

  useEffect(() => {
    loadInitialRecommendations();
  }, []);

  const loadInitialRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoMoreAvailable(false);

      // Validate based on selected path
      if (selections.path === 'genre' && !selections.genres.length) {
        throw new Error('Please select at least one genre');
      }
      if (selections.path === 'mood' && !selections.moods.length) {
        throw new Error('Please select at least one mood');
      }

      const movies = await getMovieRecommendations(
        selections.genres,
        selections.subgenres,
        selections.favorites,
        selections.moods,
        selections.acclaimed,
        selections.timeframes
      );

      if (!movies.length) {
        throw new Error('No movies found matching your criteria. Please try adjusting your preferences.');
      }

      recommendationsRef.current = movies;
      setRecommendations(movies);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      let errorMessage = 'Failed to load recommendations. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'There was an issue with the AI service. Please try again later or contact support.';
        } else if (err.message.includes('rate limit')) {
          errorMessage = 'We\'re getting too many requests. Please wait a moment and try again.';
        } else if (err.message.includes('No movies found')) {
          errorMessage = err.message;
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRecommendations = async () => {
    if (recommendations.length >= MAX_TOTAL_MOVIES || noMoreAvailable) return;

    try {
      setLoadingMore(true);
      setError(null);

      const existingTitles = recommendationsRef.current.map(r => r.title);
      const newMovies = await getMovieRecommendations(
        selections.genres,
        selections.subgenres,
        selections.favorites,
        selections.moods,
        selections.acclaimed,
        selections.timeframes,
        existingTitles
      );

      if (!newMovies.length) {
        setNoMoreAvailable(true);
        return;
      }

      const updatedRecommendations = [...recommendationsRef.current, ...newMovies];
      recommendationsRef.current = updatedRecommendations;
      setRecommendations(updatedRecommendations);
    } catch (err) {
      console.error('Error loading more recommendations:', err);
      setNoMoreAvailable(true);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleNext = () => {
    if (currentIndex >= recommendations.length - 1) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrevious = () => {
    if (currentIndex <= 0) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Finding your perfect movie match!
          </h3>
          <p className="text-gray-600">
            Our friendly movie expert is picking the best films for you...
          </p>
        </div>

        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full animate-progress" />
        </div>
      </div>
    );
  }

  if (error && !recommendations.length) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 max-w-md">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {showBackButton && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftCircle className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center">
          <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg flex items-start gap-3 max-w-md">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>No movies found matching your criteria. Try adjusting your preferences.</p>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          {showBackButton && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftCircle className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  const currentMovie = recommendationsRef.current[currentIndex];
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < recommendations.length - 1;
  const showLoadMore = currentIndex === recommendations.length - 1 && recommendations.length < MAX_TOTAL_MOVIES && !noMoreAvailable;
  const batchNumber = Math.floor(recommendations.length / MOVIES_PER_BATCH);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Here are your personalized movie recommendations!
        </h2>
        <p className="text-gray-600">
          Use the arrows to browse through recommendations.
          {!noMoreAvailable && recommendations.length < MAX_TOTAL_MOVIES && ' Click "Get More Recommendations" below to see additional options.'}
        </p>
        <div className="text-sm text-gray-500">
          Showing movie {currentIndex + 1} of {recommendations.length}
          {!noMoreAvailable && recommendations.length < MAX_TOTAL_MOVIES && ' (More available)'}
        </div>
        {/* Daily limit messaging removed for launch validation */}
      </div>

      {/* Movie Actions Legend */}
      <div className="flex items-center justify-center gap-8 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-50 rounded-full text-yellow-500">
            <Popcorn className="h-5 w-5" />
          </div>
          <span className="text-sm text-gray-600">Add to Watchlist</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-full text-green-500">
            <Check className="h-5 w-5" />
          </div>
          <span className="text-sm text-gray-600">Mark as Watched</span>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="relative">
        <div
          ref={carouselRef}
          className="overflow-hidden bg-white rounded-lg shadow-lg"
        >
          <div
            className={cn(
              "transition-transform duration-300 ease-in-out",
              isTransitioning && "transform"
            )}
          >
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 p-4">
                <div className="relative w-full" style={{ paddingBottom: '150%' }}>
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                    {currentMovie.posterUrl ? (
                      <img
                        src={currentMovie.posterUrl}
                        alt={`${currentMovie.title} poster`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3 p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {currentMovie.title} ({currentMovie.year})
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      {currentMovie.rating && (
                        <span className="inline-block px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded">
                          {currentMovie.rating}
                        </span>
                      )}
                      {currentMovie.runtime && (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {formatRuntime(currentMovie.runtime)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentMovie.tmdbId && (
                      <>
                        <WatchedButton
                          tmdbId={currentMovie.tmdbId}
                          title={currentMovie.title}
                          year={currentMovie.year}
                          posterUrl={currentMovie.posterUrl}
                          overview={currentMovie.description}
                        />
                        <WatchlistButton
                          tmdbId={currentMovie.tmdbId}
                          title={currentMovie.title}
                          year={currentMovie.year}
                          posterUrl={currentMovie.posterUrl}
                          overview={currentMovie.description}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {currentMovie.rottenTomatoesScore && (
                    <div className="flex items-center gap-1">
                      <span className="text-red-600">🍅</span>
                      <span>{currentMovie.rottenTomatoesScore}%</span>
                    </div>
                  )}
                  {currentMovie.imdbRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{currentMovie.imdbRating}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User2 className="h-5 w-5 mt-1 flex-shrink-0 text-gray-400" />
                    <div className="text-gray-600">
                      <div className="font-medium">Director:</div>
                      <div>{currentMovie.director}</div>
                      <div className="font-medium mt-2">Cast:</div>
                      <div>{currentMovie.cast.join(', ')}</div>
                    </div>
                  </div>
                  <p className="text-gray-600">{currentMovie.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentMovie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {currentMovie.matchReason && (
                  <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-indigo-700 text-sm">
                      <span className="font-medium">Why this matches your preferences: </span>
                      {currentMovie.matchReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrevious}
          disabled={!canGoBack}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6",
            "w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center",
            "text-gray-600 hover:text-gray-900 focus:outline-none",
            !canGoBack && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          disabled={!canGoForward}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-6",
            "w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center",
            "text-gray-600 hover:text-gray-900 focus:outline-none",
            !canGoForward && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="flex justify-center space-x-4">
        {showLoadMore && (
          <button
            onClick={loadMoreRecommendations}
            disabled={loadingMore}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-lg",
              "bg-indigo-600 text-white font-medium",
              "hover:bg-indigo-700 transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
              loadingMore && "opacity-50 cursor-not-allowed"
            )}
          >
            <RefreshCw className={cn("h-5 w-5", loadingMore && "animate-spin")} />
            {loadingMore ? 'Loading...' : `Get More Recommendations (Batch ${batchNumber + 1} of 3)`}
          </button>
        )}

        {noMoreAvailable && recommendations.length < MAX_TOTAL_MOVIES && (
          <div className="text-gray-600 text-sm">
            No more movies available matching your criteria.
          </div>
        )}

        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-indigo-600 font-medium hover:text-indigo-700 focus:outline-none"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}