import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, Film, Clapperboard, Camera, Video, Projector, Tv2 } from 'lucide-react';

interface TimeframeOption {
  id: string;
  name: string;
  description: string;
  years: string;
  examples: string;
  icon: React.ReactNode;
}

const timeframes: TimeframeOption[] = [
  {
    id: '1970-1989',
    name: '70s & 80s Classics',
    description: 'Golden age of blockbusters and genre-defining films',
    years: '1970-1989',
    examples: 'Star Wars, The Godfather, E.T.',
    icon: <Film className="h-6 w-6" />
  },
  {
    id: '1990-1999',
    name: '90s Gems',
    description: 'Era of groundbreaking special effects and indie breakthroughs',
    years: '1990-1999',
    examples: 'Pulp Fiction, The Matrix, Jurassic Park',
    icon: <Clapperboard className="h-6 w-6" />
  },
  {
    id: '2000-2009',
    name: '2000s Favorites',
    description: 'Digital revolution and franchise beginnings',
    years: '2000-2009',
    examples: 'The Dark Knight, Lord of the Rings, Avatar',
    icon: <Camera className="h-6 w-6" />
  },
  {
    id: '2010-2019',
    name: '2010s Hits',
    description: 'Superhero boom and streaming revolution',
    years: '2010-2019',
    examples: 'Inception, Avengers, Get Out',
    icon: <Video className="h-6 w-6" />
  },
  {
    id: '2020-present',
    name: '2020 till Present',
    description: 'Latest and greatest in cinema',
    years: '2020 till present',
    examples: 'Oppenheimer, Barbie, Dune',
    icon: <Projector className="h-6 w-6" />
  },
  {
    id: 'any',
    name: 'No Time Preference',
    description: 'Show me great movies from any era',
    years: 'All years',
    examples: 'Best movies regardless of release date',
    icon: <Tv2 className="h-6 w-6" />
  }
];

interface Props {
  selectedTimeframes: string[];
  onSelect: (timeframes: string[]) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function TimeframeSelection({ selectedTimeframes: initialSelectedTimeframes, onSelect, onBack, showBackButton }: Props) {
  const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>(initialSelectedTimeframes);
  const [error, setError] = useState<string | null>(null);

  const handleTimeframeToggle = (timeframeId: string) => {
    setSelectedTimeframes(prev => {
      let newSelection: string[];
      
      if (timeframeId === 'any') {
        // If 'any' is selected, clear all other selections
        newSelection = prev.includes('any') ? [] : ['any'];
      } else {
        // If a specific timeframe is selected, remove 'any' if it's there
        newSelection = prev.filter(id => id !== 'any');
        
        if (prev.includes(timeframeId)) {
          newSelection = newSelection.filter(id => id !== timeframeId);
        } else {
          newSelection = [...newSelection, timeframeId];
        }
      }
      
      setError(null);
      return newSelection;
    });
  };

  const handleSubmit = () => {
    if (selectedTimeframes.length === 0) {
      // Default to 'any' if nothing is selected
      onSelect(['any']);
    } else {
      onSelect(selectedTimeframes);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Do you have a preferred movie era in mind?
        </h2>
        <p className="text-gray-600">
          Select one or more time periods, or choose 'No Time Preference' for recommendations from any era.
        </p>
      </div>

      <div className="grid gap-4">
        {timeframes.map((timeframe) => (
          <button
            key={timeframe.id}
            onClick={() => handleTimeframeToggle(timeframe.id)}
            className={cn(
              "text-left p-4 rounded-lg border-2 transition-all",
              "hover:bg-indigo-50",
              selectedTimeframes.includes(timeframe.id)
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={cn(
                  "p-2 rounded-full",
                  selectedTimeframes.includes(timeframe.id)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {timeframe.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{timeframe.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{timeframe.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Examples: {timeframe.examples}
                  </p>
                </div>
              </div>
              {selectedTimeframes.includes(timeframe.id) && (
                <span className="bg-indigo-600 text-white text-sm px-2 py-1 rounded">
                  Selected
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

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
          Get Movie Recommendations
        </button>
      </div>
    </div>
  );
}