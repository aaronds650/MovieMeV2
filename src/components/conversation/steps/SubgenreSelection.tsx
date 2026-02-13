import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ChevronLeft } from 'lucide-react';

interface SubgenreOption {
  id: string;
  name: string;
  description: string;
  examples: string;
}

const subgenresByGenre: Record<string, SubgenreOption[]> = {
  comedy: [
    {
      id: 'slapstick',
      name: 'Slapstick',
      description: 'Physical comedy and visual gags',
      examples: 'Dumb and Dumber, The Naked Gun'
    },
    {
      id: 'dark-comedy',
      name: 'Dark Comedy',
      description: 'Humor from dark or serious situations',
      examples: 'The Death of Stalin, Fargo'
    },
    {
      id: 'crude',
      name: 'Crude/Raunchy',
      description: 'Adult humor and outrageous situations',
      examples: 'Superbad, American Pie'
    },
    {
      id: 'dry-witty',
      name: 'Dry/Witty',
      description: 'Subtle humor and clever wordplay',
      examples: 'Monty Python, The Office'
    },
    {
      id: 'feel-good',
      name: 'Feel-Good/Heartwarming',
      description: 'Uplifting stories with humor',
      examples: 'Mrs. Doubtfire, The Intern'
    },
    {
      id: 'satirical',
      name: 'Satirical/Parody',
      description: 'Humor through imitation and commentary',
      examples: 'Airplane!, Scary Movie'
    },
    {
      id: 'absurdist',
      name: 'Absurdist/Surreal',
      description: 'Strange and unconventional humor',
      examples: 'Napoleon Dynamite, The Big Lebowski'
    }
  ],
  thriller: [
    {
      id: 'psychological',
      name: 'Psychological Thriller',
      description: 'Mind-bending suspense and mental manipulation',
      examples: 'Gone Girl, Black Swan'
    },
    {
      id: 'crime',
      name: 'Crime Thriller',
      description: 'Criminal investigations and intense pursuits',
      examples: 'Prisoners, No Country for Old Men'
    },
    {
      id: 'mystery',
      name: 'Mystery Thriller',
      description: 'Complex puzzles and dark revelations',
      examples: 'Se7en, The Girl with the Dragon Tattoo'
    },
    {
      id: 'action-thriller',
      name: 'Action Thriller',
      description: 'High-stakes action and suspense',
      examples: 'Mad Max: Fury Road, John Wick'
    },
    {
      id: 'espionage',
      name: 'Espionage/Spy Thriller',
      description: 'International intrigue and covert operations',
      examples: 'Tinker Tailor Soldier Spy, Skyfall'
    }
  ],
  action: [
    {
      id: 'military',
      name: 'Military/War Action',
      description: 'Combat and military operations',
      examples: 'Saving Private Ryan, Black Hawk Down'
    },
    {
      id: 'fast-paced',
      name: 'Fast-Paced Action',
      description: 'Non-stop thrills and excitement',
      examples: 'Mad Max: Fury Road, Speed'
    },
    {
      id: 'martial-arts',
      name: 'Martial Arts Action',
      description: 'Combat sports and fighting expertise',
      examples: 'Ip Man, The Raid'
    },
    {
      id: 'heist',
      name: 'Heist Action',
      description: 'Complex robberies and elaborate plans',
      examples: 'Baby Driver, Ocean\'s Eleven'
    },
    {
      id: 'superhero',
      name: 'Superhero Action',
      description: 'Superpowered heroes and villains',
      examples: 'Avengers: Endgame, The Dark Knight'
    }
  ],
  documentary: [
    {
      id: 'nature',
      name: 'Nature/Science',
      description: 'Natural world and scientific discoveries',
      examples: 'Our Planet, Cosmos'
    },
    {
      id: 'true-crime',
      name: 'True Crime',
      description: 'Real criminal cases and investigations',
      examples: 'Making a Murderer, The Jinx'
    },
    {
      id: 'historical',
      name: 'Historical',
      description: 'Past events and their impact',
      examples: '13th, They Shall Not Grow Old'
    },
    {
      id: 'music-culture',
      name: 'Music & Pop Culture',
      description: 'Artists, bands, and cultural phenomena',
      examples: 'Amy, Bohemian Rhapsody'
    },
    {
      id: 'political',
      name: 'Political & Social',
      description: 'Current events and social issues',
      examples: 'Fahrenheit 9/11, Inside Job'
    }
  ],
  romance: [
    {
      id: 'romcom',
      name: 'Romantic Comedy',
      description: 'Love stories with humor and charm',
      examples: 'Crazy, Stupid, Love, 10 Things I Hate About You'
    },
    {
      id: 'tragic',
      name: 'Tragic Romance',
      description: 'Heart-wrenching love stories',
      examples: 'Atonement, Titanic'
    },
    {
      id: 'passionate',
      name: 'Passionate & Intense',
      description: 'Deep emotional connections',
      examples: 'The Notebook, Call Me by Your Name'
    },
    {
      id: 'period',
      name: 'Period Romance',
      description: 'Historical love stories',
      examples: 'Pride & Prejudice, Sense & Sensibility'
    },
    {
      id: 'lighthearted',
      name: 'Lighthearted & Fun',
      description: 'Upbeat and entertaining romance',
      examples: 'Legally Blonde, Clueless'
    }
  ],
  'scifi-fantasy': [
    {
      id: 'space',
      name: 'Space Sci-Fi',
      description: 'Space exploration and cosmic adventures',
      examples: 'Interstellar, The Martian'
    },
    {
      id: 'alien',
      name: 'Alien/Extraterrestrial',
      description: 'First contact and alien encounters',
      examples: 'Arrival, District 9'
    },
    {
      id: 'superhero-scifi',
      name: 'Superhero Sci-Fi',
      description: 'Science-based superhero stories',
      examples: 'X-Men, Guardians of the Galaxy'
    },
    {
      id: 'dystopian',
      name: 'Dystopian Sci-Fi',
      description: 'Future societies gone wrong',
      examples: 'Blade Runner 2049, The Hunger Games'
    },
    {
      id: 'fantasy-adventure',
      name: 'Fantasy Adventure',
      description: 'Magical quests and epic journeys',
      examples: 'The Lord of the Rings, Harry Potter'
    }
  ],
  horror: [
    {
      id: 'slasher',
      name: 'Slasher Horror',
      description: 'Serial killers and survival',
      examples: 'Halloween, Scream'
    },
    {
      id: 'paranormal',
      name: 'Paranormal/Supernatural',
      description: 'Ghosts and supernatural entities',
      examples: 'The Conjuring, Insidious'
    },
    {
      id: 'psychological-horror',
      name: 'Psychological Horror',
      description: 'Mental terror and psychological fear',
      examples: 'Hereditary, The Babadook'
    },
    {
      id: 'body-horror',
      name: 'Body Horror',
      description: 'Physical transformation and mutation',
      examples: 'The Fly, The Thing'
    },
    {
      id: 'scifi-horror',
      name: 'Sci-Fi Horror',
      description: 'Science gone wrong and cosmic horror',
      examples: 'Alien, Event Horizon'
    }
  ],
  drama: [
    {
      id: 'character-driven',
      name: 'Character-Driven Drama',
      description: 'Deep personal journeys',
      examples: 'The Pursuit of Happyness, The Whale'
    },
    {
      id: 'family',
      name: 'Family Drama',
      description: 'Complex family relationships',
      examples: 'Little Women, Marriage Story'
    },
    {
      id: 'legal',
      name: 'Courtroom/Legal Drama',
      description: 'Legal battles and justice',
      examples: 'A Few Good Men, The Trial of the Chicago 7'
    },
    {
      id: 'crime-drama',
      name: 'Crime Drama',
      description: 'Criminal underworld and consequences',
      examples: 'The Irishman, American Gangster'
    },
    {
      id: 'historical',
      name: 'Historical/Biopic Drama',
      description: 'True stories and historical events',
      examples: 'Schindler\'s List, The King\'s Speech'
    }
  ]
};

interface Props {
  selectedGenres: string[];
  selectedSubgenres: string[];
  onSelect: (subgenres: string[]) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function SubgenreSelection({ selectedGenres, selectedSubgenres: initialSelectedSubgenres, onSelect, onBack, showBackButton }: Props) {
  const [selectedSubgenres, setSelectedSubgenres] = useState<string[]>(initialSelectedSubgenres);
  const [error, setError] = useState<string | null>(null);

  const availableSubgenres = selectedGenres.flatMap(genre => 
    subgenresByGenre[genre] || []
  );

  const handleSubgenreToggle = (subgenreId: string) => {
    setSelectedSubgenres(prev => {
      if (prev.includes(subgenreId)) {
        return prev.filter(id => id !== subgenreId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      setError(null);
      return [...prev, subgenreId];
    });
  };

  const handleSubmit = () => {
    if (selectedSubgenres.length === 0) {
      setError('Please select at least one subgenre');
      return;
    }
    onSelect(selectedSubgenres);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Nice choice!
        </h2>
        <p className="text-gray-600">
          Which of these styles fits what you're looking for? You can pick up to 3.
        </p>
      </div>

      <div className="grid gap-4">
        {availableSubgenres.map((subgenre) => (
          <button
            key={subgenre.id}
            onClick={() => handleSubgenreToggle(subgenre.id)}
            disabled={selectedSubgenres.length >= 3 && !selectedSubgenres.includes(subgenre.id)}
            className={cn(
              "text-left p-4 rounded-lg border-2 transition-all",
              "hover:bg-indigo-50",
              selectedSubgenres.includes(subgenre.id)
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200",
              selectedSubgenres.length >= 3 && !selectedSubgenres.includes(subgenre.id)
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{subgenre.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{subgenre.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Examples: {subgenre.examples}
                </p>
              </div>
              {selectedSubgenres.includes(subgenre.id) && (
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