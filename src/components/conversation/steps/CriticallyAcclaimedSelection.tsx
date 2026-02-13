import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft, Trophy, ThumbsUp } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const options: Option[] = [
  {
    id: 'yes',
    name: 'Yes, prioritize highly-rated films',
    description: 'Focus on movies with high critic scores and award recognition',
    icon: <Trophy className="h-6 w-6" />
  },
  {
    id: 'no',
    name: 'No, just show movies that match my preferences',
    description: 'Show me movies based on my selected genres, moods, and favorites',
    icon: <ThumbsUp className="h-6 w-6" />
  }
];

interface Props {
  selectedOption: string;
  onSelect: (option: string) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function CriticallyAcclaimedSelection({ selectedOption: initialSelectedOption, onSelect, onBack, showBackButton }: Props) {
  const [selectedOption, setSelectedOption] = useState<string>(initialSelectedOption);
  const [error, setError] = useState<string | null>(null);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setError(null);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }
    onSelect(selectedOption);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Do you want to prioritize award-winning & critically acclaimed movies?
        </h2>
        <p className="text-gray-600">
          Choose whether to focus on highly-rated films or see all movies that match your preferences.
        </p>
      </div>

      <div className="grid gap-4">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={cn(
              "text-left p-4 rounded-lg border-2 transition-all",
              "hover:bg-indigo-50",
              selectedOption === option.id
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={cn(
                  "p-2 rounded-full",
                  selectedOption === option.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{option.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
              {selectedOption === option.id && (
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
          Next
        </button>
      </div>
    </div>
  );
}