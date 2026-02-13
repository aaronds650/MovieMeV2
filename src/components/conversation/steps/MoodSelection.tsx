import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, Heart, Zap, CloudRain, Sun, Brain, Sparkles } from 'lucide-react';

interface MoodOption {
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

const moods: MoodOption[] = [
  {
    id: 'feel-good',
    name: 'Feel-Good',
    emoji: '🎉',
    description: 'Uplifting stories that leave you feeling happy and inspired',
    examples: 'The Secret Life of Walter Mitty, Little Miss Sunshine, Chef',
    icon: <Heart className="h-6 w-6" />,
    color: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      hover: 'hover:bg-yellow-50',
      selected: {
        bg: 'bg-yellow-100',
        icon: 'bg-yellow-500 text-white',
        border: 'border-yellow-500',
      },
    },
  },
  {
    id: 'lighthearted',
    name: 'Lighthearted',
    emoji: '😆',
    description: 'Fun, easy-going entertainment with plenty of laughs',
    examples: 'The Princess Bride, School of Rock, Game Night',
    icon: <Sun className="h-6 w-6" />,
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
  },
  {
    id: 'thought-provoking',
    name: 'Thought-Provoking',
    emoji: '🤯',
    description: 'Intellectually stimulating films that challenge your perspective',
    examples: 'Inception, Arrival, Ex Machina',
    icon: <Brain className="h-6 w-6" />,
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-50',
      selected: {
        bg: 'bg-purple-100',
        icon: 'bg-purple-500 text-white',
        border: 'border-purple-500',
      },
    },
  },
  {
    id: 'suspenseful',
    name: 'Suspenseful',
    emoji: '😱',
    description: 'Edge-of-your-seat tension and thrilling moments',
    examples: 'Sicario, Wind River, Prisoners',
    icon: <Zap className="h-6 w-6" />,
    color: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      hover: 'hover:bg-red-50',
      selected: {
        bg: 'bg-red-100',
        icon: 'bg-red-500 text-white',
        border: 'border-red-500',
      },
    },
  },
  {
    id: 'dark-psychological',
    name: 'Dark & Psychological',
    emoji: '🖤',
    description: 'Complex psychological narratives with dark themes',
    examples: 'Gone Girl, Nightcrawler, The Girl with the Dragon Tattoo',
    icon: <CloudRain className="h-6 w-6" />,
    color: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      hover: 'hover:bg-slate-50',
      selected: {
        bg: 'bg-slate-100',
        icon: 'bg-slate-500 text-white',
        border: 'border-slate-500',
      },
    },
  },
  {
    id: 'gritty-raw',
    name: 'Gritty & Raw',
    emoji: '🎭',
    description: 'Raw, intense stories that don\'t hold back',
    examples: 'There Will Be Blood, No Country for Old Men, The Wrestler',
    icon: <CloudRain className="h-6 w-6" />,
    color: {
      bg: 'bg-zinc-50',
      text: 'text-zinc-600',
      hover: 'hover:bg-zinc-50',
      selected: {
        bg: 'bg-zinc-100',
        icon: 'bg-zinc-500 text-white',
        border: 'border-zinc-500',
      },
    },
  },
  {
    id: 'any',
    name: 'No Mood Preference',
    emoji: '✨',
    description: 'Open to any type of movie',
    examples: 'Show me everything that matches my other preferences',
    icon: <Sparkles className="h-6 w-6" />,
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
];

interface Props {
  selectedMoods: string[];
  onSelect: (moods: string[]) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function MoodSelection({ selectedMoods: initialSelectedMoods, onSelect, onBack, showBackButton }: Props) {
  const [selectedMoods, setSelectedMoods] = useState<string[]>(initialSelectedMoods);
  const [error, setError] = useState<string | null>(null);

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods(prev => {
      let newSelection: string[];
      
      if (moodId === 'any') {
        // If 'any' is selected, clear all other selections
        newSelection = prev.includes('any') ? [] : ['any'];
      } else {
        // If a specific mood is selected, remove 'any' if it's there
        newSelection = prev.filter(id => id !== 'any');
        
        if (prev.includes(moodId)) {
          newSelection = newSelection.filter(id => id !== moodId);
        } else if (newSelection.length < 2) { // Changed to 2 for max selection
          newSelection = [...newSelection, moodId];
        }
      }
      
      setError(null);
      return newSelection;
    });
  };

  const handleSubmit = () => {
    if (selectedMoods.length === 0) {
      // Default to 'any' if nothing is selected
      onSelect(['any']);
    } else {
      onSelect(selectedMoods);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          What kind of mood or tone are you looking for in your movie?
        </h2>
        <p className="text-gray-600">
          Select up to 2 moods to expand your recommendations, or choose 'No Mood Preference' for a broader selection.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {moods.map((mood) => {
          const isSelected = selectedMoods.includes(mood.id);
          const isDisabled = selectedMoods.length >= 2 && !selectedMoods.includes(mood.id) && mood.id !== 'any';
          
          return (
            <button
              key={mood.id}
              onClick={() => handleMoodToggle(mood.id)}
              disabled={isDisabled}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all duration-200",
                mood.color.hover,
                isSelected
                  ? cn(mood.color.selected.bg, mood.color.selected.border)
                  : "border-gray-200",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-full transition-colors duration-200 flex-shrink-0",
                  isSelected
                    ? mood.color.selected.icon
                    : cn("bg-white", mood.color.text)
                )}>
                  {mood.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-medium transition-colors duration-200",
                      isSelected ? mood.color.text : "text-gray-900"
                    )}>
                      {mood.emoji} {mood.name}
                    </span>
                    {isSelected && (
                      <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {mood.description}
                  </p>
                  {mood.id !== 'any' && (
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Examples:</span> {mood.examples}
                    </p>
                  )}
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