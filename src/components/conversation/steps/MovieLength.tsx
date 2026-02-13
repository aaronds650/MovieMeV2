import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Clock, ChevronLeft } from 'lucide-react';

interface DurationOption {
  id: string;
  name: string;
  description: string;
  examples: string;
  icon: React.ReactNode;
}

const durations: DurationOption[] = [
  {
    id: 'short',
    name: 'Short & sweet',
    description: 'Less than 90 minutes',
    examples: 'Zombieland, A Quiet Place',
    icon: <Clock className="h-6 w-6" />
  },
  {
    id: 'standard',
    name: 'Standard',
    description: '90-120 minutes',
    examples: 'Knives Out, The Wolf of Wall Street',
    icon: <Clock className="h-6 w-6" />
  },
  {
    id: 'epic',
    name: 'Epic',
    description: 'More than 2.5 hours',
    examples: 'Interstellar, The Godfather',
    icon: <Clock className="h-6 w-6" />
  },
  {
    id: 'any',
    name: 'No preference',
    description: 'Just give me something great!',
    examples: 'Any length is fine',
    icon: <Clock className="h-6 w-6" />
  }
];

interface Props {
  selectedDuration: string;
  onSelect: (duration: string) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function MovieLength({ selectedDuration: initialSelectedDuration, onSelect, onBack, showBackButton }: Props) {
  const [selectedDuration, setSelectedDuration] = useState<string>(initialSelectedDuration);
  const [error, setError] = useState<string | null>(null);

  const handleDurationSelect = (durationId: string) => {
    setSelectedDuration(durationId);
    setError(null);
  };

  const handleSubmit = () => {
    if (!selectedDuration) {
      setError('Please select a duration preference');
      return;
    }
    onSelect(selectedDuration);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Do you want something short, a standard-length movie, or an epic film?
        </h2>
        <p className="text-gray-600">
          Choose your preferred movie length.
        </p>
      </div>

      <div className="grid gap-4">
        {durations.map((duration) => (
          <button
            key={duration.id}
            onClick={() => handleDurationSelect(duration.id)}
            className={cn(
              "text-left p-4 rounded-lg border-2 transition-all",
              "hover:bg-indigo-50",
              selectedDuration === duration.id
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200"
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className={cn(
                  "p-2 rounded-full",
                  selectedDuration === duration.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {duration.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{duration.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{duration.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Examples: {duration.examples}
                  </p>
                </div>
              </div>
              {selectedDuration === duration.id && (
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