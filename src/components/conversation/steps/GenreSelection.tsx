import React, { useState } from 'react';
import { cn } from '../../../lib/utils';
import { Home as Comedy, Sword, Heart, Ghost, Film, Drama, Rocket, FileVideo } from 'lucide-react';

interface GenreOption {
  id: string;
  name: string;
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

const genres: GenreOption[] = [
  {
    id: 'comedy',
    name: 'Comedy',
    icon: <Comedy className="h-6 w-6" />,
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
    id: 'thriller',
    name: 'Thriller',
    icon: <Sword className="h-6 w-6" />,
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
    id: 'action',
    name: 'Action',
    icon: <Film className="h-6 w-6" />,
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
    id: 'drama',
    name: 'Drama',
    icon: <Drama className="h-6 w-6" />,
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
    id: 'scifi-fantasy',
    name: 'Sci-Fi/Fantasy',
    icon: <Rocket className="h-6 w-6" />,
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
    id: 'romance',
    name: 'Romance',
    icon: <Heart className="h-6 w-6" />,
    color: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      hover: 'hover:bg-pink-50',
      selected: {
        bg: 'bg-pink-100',
        icon: 'bg-pink-500 text-white',
        border: 'border-pink-500',
      },
    },
  },
  {
    id: 'horror',
    name: 'Horror',
    icon: <Ghost className="h-6 w-6" />,
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
    id: 'documentary',
    name: 'Documentary',
    icon: <FileVideo className="h-6 w-6" />,
    color: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      hover: 'hover:bg-green-50',
      selected: {
        bg: 'bg-green-100',
        icon: 'bg-green-500 text-white',
        border: 'border-green-500',
      },
    },
  },
];

interface Props {
  selectedGenres: string[];
  onSelect: (genres: string[]) => void;
}

export function GenreSelection({ selectedGenres: initialSelectedGenres, onSelect }: Props) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialSelectedGenres);
  const [error, setError] = useState<string | null>(null);

  const handleGenreToggle = (genreId: string) => {
    setSelectedGenres(prev => {
      const newSelection = prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId];
      setError(null);
      return newSelection;
    });
  };

  const handleSubmit = () => {
    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
      return;
    }
    onSelect(selectedGenres);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Hey! Let's find the perfect movie for you.
        </h2>
        <p className="text-gray-600">
          What kind of movie are you in the mood for?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {genres.map((genre) => {
          const isSelected = selectedGenres.includes(genre.id);
          return (
            <button
              key={genre.id}
              onClick={() => handleGenreToggle(genre.id)}
              className={cn(
                "flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200",
                genre.color.hover,
                isSelected
                  ? cn(genre.color.selected.bg, genre.color.selected.border)
                  : "border-gray-200"
              )}
            >
              <div className={cn(
                "p-3 rounded-full mb-2 transition-colors duration-200",
                isSelected
                  ? genre.color.selected.icon
                  : cn("bg-white", genre.color.text)
              )}>
                {genre.icon}
              </div>
              <span className={cn(
                "font-medium transition-colors duration-200",
                isSelected ? genre.color.text : "text-gray-900"
              )}>
                {genre.name}
              </span>
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