import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, Turtle, Scale, Rocket } from 'lucide-react';

interface PaceOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  examples: string;
  icon: React.ReactNode;
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

const paces: PaceOption[] = [
  {
    id: 'slow-burn',
    name: 'Slow Burn',
    emoji: '🐢',
    description: 'Deep, methodical, atmospheric pacing that builds tension gradually',
    examples: 'Zodiac, There Will Be Blood, The Power of the Dog',
    icon: <Turtle className="h-6 w-6" />,
    color: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      hover: 'hover:bg-emerald-50',
      selected: {
        bg: 'bg-emerald-100',
        icon: 'bg-emerald-500 text-white',
        border: 'border-emerald-500',
      },
    },
  },
  {
    id: 'balanced',
    name: 'Balanced',
    emoji: '⚖️',
    description: 'Well-paced, engaging storytelling that maintains steady momentum',
    examples: 'The Dark Knight, Inception, The Departed',
    icon: <Scale className="h-6 w-6" />,
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-50',
      selected: {
        bg: 'bg-blue-100',
        icon: 'bg-blue-500 text-white',
        border: 'border-blue-500',
      },
    },
  },
  {
    id: 'fast-paced',
    name: 'Fast-Paced',
    emoji: '🚀',
    description: 'High-energy, action-packed, intense momentum throughout',
    examples: 'Mad Max: Fury Road, Uncut Gems, Mission: Impossible',
    icon: <Rocket className="h-6 w-6" />,
    color: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-50',
      selected: {
        bg: 'bg-orange-100',
        icon: 'bg-orange-500 text-white',
        border: 'border-orange-500',
      },
    },
  }
];

interface Props {
  selectedPace: string;
  onSelect: (pace: string) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function PaceSelection({ selectedPace: initialSelectedPace, onSelect, onBack, showBackButton }: Props) {
  const [selectedPace, setSelectedPace] = useState<string>(initialSelectedPace);
  const [error, setError] = useState<string | null>(null);

  const handlePaceSelect = (paceId: string) => {
    setSelectedPace(paceId);
    setError(null);
  };

  const handleSubmit = () => {
    if (!selectedPace) {
      setError('Please select a pacing preference');
      return;
    }
    onSelect(selectedPace);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          What kind of pacing do you prefer?
        </h2>
        <p className="text-gray-600">
          Choose the storytelling pace that best matches your current viewing mood.
        </p>
      </div>

      <div className="grid gap-4">
        {paces.map((pace) => {
          const isSelected = selectedPace === pace.id;
          
          return (
            <button
              key={pace.id}
              onClick={() => handlePaceSelect(pace.id)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                pace.color.hover,
                isSelected
                  ? cn(pace.color.selected.bg, pace.color.selected.border)
                  : "border-gray-200"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-full transition-colors duration-200 flex-shrink-0",
                  isSelected
                    ? pace.color.selected.icon
                    : cn("bg-white", pace.color.text)
                )}>
                  {pace.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium transition-colors duration-200",
                      isSelected ? pace.color.text : "text-gray-900"
                    )}>
                      {pace.emoji} {pace.name}
                    </span>
                    {isSelected && (
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {pace.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-medium">Examples:</span> {pace.examples}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
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
          Continue
        </button>
      </div>
    </div>
  );
}