import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft } from 'lucide-react';

interface PreferenceOption {
  id: string;
  name: string;
  description: string;
}

const preferencesByGenre: Record<string, PreferenceOption[]> = {
  comedy: [
    {
      id: 'clever-dialogue',
      name: 'The clever dialogue & wordplay',
      description: 'Smart, witty conversations and memorable quotes'
    },
    {
      id: 'over-top-humor',
      name: 'The ridiculous, over-the-top humor',
      description: 'Outrageous situations and extreme comedy'
    },
    {
      id: 'absurd-situations',
      name: 'The absurd situations',
      description: 'Unexpected and bizarre scenarios'
    },
    {
      id: 'twists-satire',
      name: 'The unexpected twists & satire',
      description: 'Surprising plot developments and social commentary'
    },
    {
      id: 'dry-delivery',
      name: 'The witty, dry delivery',
      description: 'Subtle humor and deadpan performances'
    },
    {
      id: 'relatable-characters',
      name: 'The relatable but exaggerated characters',
      description: 'Characters that feel real despite their quirks'
    },
    {
      id: 'humor-heart',
      name: 'The mix of humor & heart',
      description: 'Balance of comedy with emotional moments'
    }
  ],
  thriller: [
    {
      id: 'psychological-tension',
      name: 'The slow-building psychological tension',
      description: 'Gradual buildup of suspense and mental pressure'
    },
    {
      id: 'plot-twists',
      name: 'The unexpected plot twists',
      description: 'Shocking revelations and surprising turns'
    },
    {
      id: 'suspenseful-pacing',
      name: 'The suspenseful, edge-of-your-seat pacing',
      description: 'Intense momentum and thrilling sequences'
    },
    {
      id: 'eerie-atmosphere',
      name: 'The eerie, unsettling atmosphere',
      description: 'Dark and foreboding mood throughout'
    },
    {
      id: 'complex-characters',
      name: 'The morally complex characters',
      description: 'Characters with questionable motives and actions'
    }
  ],
  horror: [
    {
      id: 'jump-scares',
      name: 'The terrifying jump scares',
      description: 'Sudden, shocking moments that make you leap'
    },
    {
      id: 'supernatural',
      name: 'The eerie supernatural elements',
      description: 'Ghostly encounters and paranormal activity'
    },
    {
      id: 'psychological-horror',
      name: 'The unsettling psychological horror',
      description: 'Mental anguish and psychological torment'
    },
    {
      id: 'atmosphere',
      name: 'The disturbing, atmospheric setting',
      description: 'Creepy locations and haunting environments'
    },
    {
      id: 'shocking-moments',
      name: 'The gruesome, shocking moments',
      description: 'Intense, horrifying scenes and revelations'
    }
  ],
  'scifi-fantasy': [
    {
      id: 'world-building',
      name: 'The immersive world-building',
      description: 'Detailed fictional universes and settings'
    },
    {
      id: 'visual-effects',
      name: 'The stunning visual effects',
      description: 'Impressive special effects and visuals'
    },
    {
      id: 'unique-concepts',
      name: 'The innovative sci-fi concepts',
      description: 'Creative technological or magical ideas'
    },
    {
      id: 'epic-scale',
      name: 'The epic scale and scope',
      description: 'Grand adventures and sweeping narratives'
    },
    {
      id: 'character-development',
      name: 'The character growth and development',
      description: 'Heroes evolving through their journey'
    }
  ],
  drama: [
    {
      id: 'emotional-depth',
      name: 'The emotional depth',
      description: 'Deep, moving character moments'
    },
    {
      id: 'complex-relationships',
      name: 'The complex relationships',
      description: 'Intricate character dynamics and connections'
    },
    {
      id: 'social-commentary',
      name: 'The powerful social commentary',
      description: 'Thought-provoking themes and messages'
    },
    {
      id: 'realistic-portrayal',
      name: 'The realistic portrayal of life',
      description: 'Authentic depiction of human experiences'
    },
    {
      id: 'character-arcs',
      name: 'The compelling character arcs',
      description: 'Meaningful personal growth and change'
    }
  ],
  action: [
    {
      id: 'action-sequences',
      name: 'The intense action sequences',
      description: 'Thrilling fights and spectacular stunts'
    },
    {
      id: 'pacing',
      name: 'The fast-paced excitement',
      description: 'Non-stop thrills and momentum'
    },
    {
      id: 'choreography',
      name: 'The impressive fight choreography',
      description: 'Well-crafted combat and action scenes'
    },
    {
      id: 'practical-effects',
      name: 'The practical effects and stunts',
      description: 'Real-world action and physical performances'
    },
    {
      id: 'hero-moments',
      name: 'The epic hero moments',
      description: 'Memorable, crowd-pleasing action beats'
    }
  ],
  documentary: [
    {
      id: 'educational-value',
      name: 'The educational insights',
      description: 'Learning new and fascinating information'
    },
    {
      id: 'real-stories',
      name: 'The compelling real-life stories',
      description: 'True events and personal narratives'
    },
    {
      id: 'expert-interviews',
      name: 'The expert perspectives',
      description: 'Insights from knowledgeable sources'
    },
    {
      id: 'cinematography',
      name: 'The beautiful cinematography',
      description: 'Stunning visuals and camera work'
    },
    {
      id: 'investigative-depth',
      name: 'The thorough investigation',
      description: 'In-depth research and analysis'
    }
  ],
  romance: [
    {
      id: 'chemistry',
      name: 'The romantic chemistry',
      description: 'Sparks between the main characters'
    },
    {
      id: 'emotional-journey',
      name: 'The emotional journey',
      description: 'Ups and downs of the love story'
    },
    {
      id: 'romantic-moments',
      name: 'The heartwarming moments',
      description: 'Sweet and touching romantic scenes'
    },
    {
      id: 'character-growth',
      name: 'The personal growth through love',
      description: 'Characters changing through relationships'
    },
    {
      id: 'romantic-tension',
      name: 'The romantic tension',
      description: 'Building anticipation and connection'
    }
  ]
};

interface Props {
  favorites: string[];
  selectedGenres: string[];
  selectedPreferences: string[];
  onSelect: (preferences: string[]) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function MoviePreferences({ favorites, selectedGenres, selectedPreferences: initialSelectedPreferences, onSelect, onBack, showBackButton }: Props) {
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialSelectedPreferences);
  const [error, setError] = useState<string | null>(null);

  // Get preferences based on selected genres
  const availablePreferences = selectedGenres.flatMap(genre => 
    preferencesByGenre[genre] || []
  );

  const handlePreferenceToggle = (preferenceId: string) => {
    setSelectedPreferences(prev => {
      if (prev.includes(preferenceId)) {
        return prev.filter(id => id !== preferenceId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      setError(null);
      return [...prev, preferenceId];
    });
  };

  const handleSubmit = () => {
    if (selectedPreferences.length === 0) {
      setError('Please select at least one preference');
      return;
    }
    onSelect(selectedPreferences);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Great picks!
        </h2>
        <p className="text-gray-600">
          What did you like most about {favorites.join(', ')}? You can pick up to 3.
        </p>
      </div>

      <div className="grid gap-4">
        {availablePreferences.map((preference) => (
          <button
            key={preference.id}
            onClick={() => handlePreferenceToggle(preference.id)}
            disabled={selectedPreferences.length >= 3 && !selectedPreferences.includes(preference.id)}
            className={cn(
              "text-left p-4 rounded-lg border-2 transition-all",
              "hover:bg-indigo-50",
              selectedPreferences.includes(preference.id)
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200",
              selectedPreferences.length >= 3 && !selectedPreferences.includes(preference.id)
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{preference.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{preference.description}</p>
              </div>
              {selectedPreferences.includes(preference.id) && (
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
          Continue
        </button>
      </div>
    </div>
  );
}