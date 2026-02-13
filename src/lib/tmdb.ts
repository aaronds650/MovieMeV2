import { debounce } from './utils';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

export interface MovieSearchResult {
  id: number;
  title: string;
  releaseDate: string;
  year: number;
  posterPath: string | null;
  overview: string;
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }

    const data = await response.json();
    
    return data.results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      releaseDate: movie.release_date,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
      posterPath: movie.poster_path ? `${TMDB_POSTER_BASE}${movie.poster_path}` : null,
      overview: movie.overview
    }));
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
}

// Debounced version of the search function
export const debouncedSearchMovies = debounce(searchMovies, 300);