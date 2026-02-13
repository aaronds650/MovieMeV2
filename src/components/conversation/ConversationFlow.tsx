import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw, Menu, X, Popcorn, Film, ArrowLeft } from 'lucide-react';
// Removed Supabase import
import { cn } from '../../lib/utils';
import { PathSelection } from './steps/PathSelection';
import { GenreSelection } from './steps/GenreSelection';
import { SubgenreSelection } from './steps/SubgenreSelection';
import { FavoriteMovies } from './steps/FavoriteMovies';
import { MoodSelection } from './steps/MoodSelection';
import { CriticallyAcclaimedSelection } from './steps/CriticallyAcclaimedSelection';
import { TimeframeSelection } from './steps/TimeframeSelection';
import { MovieRecommendations } from './steps/MovieRecommendations';
import { WatchlistDropdown } from '../ui/WatchlistDropdown';
import { WatchedMoviesDropdown } from '../ui/WatchedMoviesDropdown';

type ConversationStep = 
  | 'path'
  | 'genres'
  | 'subgenres'
  | 'favorites'
  | 'mood'
  | 'mood-favorites'
  | 'acclaimed'
  | 'timeframe'
  | 'recommendations';

interface UserSelections {
  path: 'genre' | 'mood' | '';
  genres: string[];
  subgenres: string[];
  favorites: string[];
  moods: string[];
  acclaimed: string;
  timeframes: string[];
}

const genreBasedSteps: ConversationStep[] = [
  'path',
  'genres',
  'subgenres',
  'favorites',
  'acclaimed',
  'timeframe',
  'recommendations'
];

const moodBasedSteps: ConversationStep[] = [
  'path',
  'mood',
  'mood-favorites',
  'acclaimed',
  'timeframe',
  'recommendations'
];

export function ConversationFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<ConversationStep>('path');
  const [selections, setSelections] = useState<UserSelections>({
    path: '',
    genres: [],
    subgenres: [],
    favorites: [],
    moods: [],
    acclaimed: '',
    timeframes: []
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const stepOrder = selections.path === 'genre' ? genreBasedSteps : moodBasedSteps;

  const handleSignOut = async () => {
    // Mock sign out - redirect to login
    window.location.href = '/login';
    navigate('/login');
  };

  const handlePathSelection = (path: 'genre' | 'mood') => {
    setSelections(prev => ({ ...prev, path }));
    setCurrentStep(path === 'genre' ? 'genres' : 'mood');
  };

  const handleGenreSelection = (genres: string[]) => {
    setSelections(prev => ({ ...prev, genres }));
    setCurrentStep('subgenres');
  };

  const handleSubgenreSelection = (subgenres: string[]) => {
    setSelections(prev => ({ ...prev, subgenres }));
    setCurrentStep('favorites');
  };

  const handleFavoriteMovies = (favorites: string[]) => {
    setSelections(prev => ({ ...prev, favorites }));
    setCurrentStep('acclaimed');
  };

  const handleMoodSelection = (moods: string[]) => {
    setSelections(prev => ({ ...prev, moods }));
    setCurrentStep('mood-favorites');
  };

  const handleMoodFavoriteMovies = (favorites: string[]) => {
    setSelections(prev => ({ ...prev, favorites }));
    setCurrentStep('acclaimed');
  };

  const handleAcclaimedSelection = (acclaimed: string) => {
    setSelections(prev => ({ ...prev, acclaimed }));
    setCurrentStep('timeframe');
  };

  const handleTimeframeSelection = (timeframes: string[]) => {
    setSelections(prev => ({ ...prev, timeframes }));
    setCurrentStep('recommendations');
  };

  const handleBack = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleStartOver = () => {
    setSelections({
      path: '',
      genres: [],
      subgenres: [],
      favorites: [],
      moods: [],
      acclaimed: '',
      timeframes: []
    });
    setCurrentStep('path');
  };

  const renderCurrentStep = () => {
    const showBackButton = stepOrder.indexOf(currentStep) > 0;

    switch (currentStep) {
      case 'path':
        return (
          <PathSelection 
            onSelect={handlePathSelection}
          />
        );
      case 'genres':
        return (
          <GenreSelection 
            selectedGenres={selections.genres}
            onSelect={handleGenreSelection} 
          />
        );
      case 'subgenres':
        return (
          <SubgenreSelection
            selectedGenres={selections.genres}
            selectedSubgenres={selections.subgenres}
            onSelect={handleSubgenreSelection}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      case 'favorites':
        return (
          <FavoriteMovies
            genres={selections.genres}
            selectedFavorites={selections.favorites}
            onSelect={handleFavoriteMovies}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      case 'mood':
        return (
          <MoodSelection
            selectedMoods={selections.moods}
            onSelect={handleMoodSelection}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      case 'mood-favorites':
        return (
          <FavoriteMovies
            genres={[]} // Empty array since we're using moods
            selectedFavorites={selections.favorites}
            onSelect={handleMoodFavoriteMovies}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      case 'acclaimed':
        return (
          <CriticallyAcclaimedSelection
            selectedOption={selections.acclaimed}
            onSelect={handleAcclaimedSelection}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      case 'timeframe':
        return (
          <TimeframeSelection
            selectedTimeframes={selections.timeframes}
            onSelect={handleTimeframeSelection}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      case 'recommendations':
        return (
          <MovieRecommendations
            selections={selections}
            onReset={handleStartOver}
            onBack={handleBack}
            showBackButton={showBackButton}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <header className="sticky top-0 z-50 py-4 px-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-indigo-600">
                MovieMe
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleStartOver}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </button>
              <WatchlistDropdown />
              <WatchedMoviesDropdown />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-2 border-t pt-4">
              <button
                onClick={() => {
                  handleStartOver();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </button>
              <div
                onClick={() => {
                  navigate('/watchlist');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <Popcorn className="h-4 w-4" />
                Watchlist
              </div>
              <div
                onClick={() => {
                  navigate('/watched');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <Film className="h-4 w-4" />
                Watched Movies
              </div>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-xl shadow-md p-8">
          {renderCurrentStep()}
        </div>
      </main>
    </div>
  );
}