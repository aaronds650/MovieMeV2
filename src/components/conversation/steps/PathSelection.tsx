import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Film, Heart, Zap } from 'lucide-react';

interface PathOption {
  id: 'genre' | 'mood';
  name: string;
  description: string;
  icon: React.ReactNode;
  steps: string[];
  color: {
    bg: string;
    text: string;
    hover: string;
    selected: {
      bg: string;
      icon: string;
      border: string;
    };
  };
}

const paths: PathOption[] = [
  {
    id: 'genre',
    name: 'Genre-Based Discovery',
    description: 'Find movies by selecting your favorite genres and subgenres',
    icon: <Film className="h-8 w-8" />,
    steps: [
      '1. Select Genre(s)',
      '2. Choose Subgenres',
      '3. Pick Movies You Like',
      '4. Set Preferences',
      '5. Get Recommendations'
    ],
    color: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-50',
      selected: {
        bg: 'bg-indigo-100',
        icon: 'bg-indigo-600 text-white',
        border: 'border-indigo-600',
      },
    },
  },
  {
    id: 'mood',
    name: 'Mood-Based Discovery',
    description: 'Find movies that match your current mood and emotional preferences',
    icon: <Heart className="h-8 w-8" />,
    steps: [
      '1. Select Mood(s)',
      '2. Pick Movies You Like',
      '3. Set Preferences',
      '4. Get Recommendations'
    ],
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      hover: 'hover:bg-rose-50',
      selected: {
        bg: 'bg-rose-100',
        icon: 'bg-rose-600 text-white',
        border: 'border-rose-600',
      },
    },
  }
];

interface Props {
  onSelect: (path: 'genre' | 'mood') => void;
}

export function PathSelection({ onSelect }: Props) {
  const [selectedPath, setSelectedPath] = useState<'genre' | 'mood' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePathSelect = (pathId: 'genre' | 'mood') => {
    setSelectedPath(pathId);
    setError(null);
  };

  const handleSubmit = () => {
    if (!selectedPath) {
      setError('Please select a discovery path');
      return;
    }
    onSelect(selectedPath);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Choose Your Movie Discovery Path
        </h2>
        <p className="text-gray-600">
          Select how you'd like to discover your next favorite movie.
        </p>
      </div>

      <div className="grid gap-6">
        {paths.map((path) => {
          const isSelected = selectedPath === path.id;
          
          return (
            <button
              key={path.id}
              onClick={() => handlePathSelect(path.id)}
              className={cn(
                "w-full text-left p-6 rounded-xl border-2 transition-all duration-200",
                path.color.hover,
                isSelected
                  ? cn(path.color.selected.bg, path.color.selected.border)
                  : "border-gray-200"
              )}
            >
              <div className="flex items-start gap-6">
                <div className={cn(
                  "p-4 rounded-xl transition-colors duration-200 flex-shrink-0",
                  isSelected
                    ? path.color.selected.icon
                    : cn("bg-white", path.color.text)
                )}>
                  {path.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={cn(
                      "text-xl font-semibold transition-colors duration-200",
                      isSelected ? path.color.text : "text-gray-900"
                    )}>
                      {path.name}
                    </h3>
                    {isSelected && (
                      <span className={cn(
                        "text-white text-xs px-2 py-0.5 rounded-full",
                        path.id === 'genre' ? "bg-indigo-600" : "bg-rose-600"
                      )}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">
                    {path.description}
                  </p>
                  <div className="space-y-1">
                    {path.steps.map((step, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-500 flex items-center gap-2"
                      >
                        <Zap className="h-3 w-3 flex-shrink-0" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-600 text-sm text-center">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        className={cn(
          "w-full py-3 px-4 rounded-lg text-white font-medium",
          "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
          "transition-colors duration-200"
        )}
      >
        Continue
      </button>
    </div>
  );
}