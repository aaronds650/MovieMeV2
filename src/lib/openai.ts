// import { getWatchedMovies } from './supabase'; // Temporarily disabled for runtime stability

// Removed client-side OpenAI - now using serverless API

export interface MovieRecommendation {
  title: string;
  year: number;
  description: string;
  rating?: string;
  genres: string[];
  cast: string[];
  director: string;
  rottenTomatoesScore?: number;
  imdbRating?: number;
  runtime?: number;
  posterUrl: string;
  matchReason: string;
  matchScore: number;
  similarToFavorites?: string[];
  tmdbId?: number;
}

const MOVIES_PER_BATCH = 5;
const MAX_RETRIES = 3;
const MAX_TOTAL_MOVIES = 15;
let previousRecommendations: Set<string> = new Set();

// TMDB configuration for poster URLs
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE = 'https://image.tmdb.org/t/p/w500';

// Recommendation weightings
const MOOD_WEIGHT = 0.40;       // 40% - Mood match importance
const FAVORITES_WEIGHT = 0.35;   // 35% - Similarity to favorite movies
const ACCLAIMED_WEIGHT = 0.20;   // 20% - Critical acclaim and ratings
const TIMEFRAME_WEIGHT = 0.15;   // 15% - Time period match

async function getMoviePoster(title: string, year: number): Promise<{ url: string | null; tmdbId: number | null }> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&year=${year}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch movie poster: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.results && data.results[0]) {
      const movie = data.results[0];
      return {
        url: movie.poster_path ? `${TMDB_POSTER_BASE}${movie.poster_path}` : null,
        tmdbId: movie.id
      };
    }
    return { url: null, tmdbId: null };
  } catch (error) {
    console.error('Error fetching movie poster:', error);
    return { url: null, tmdbId: null };
  }
}

export async function getMovieRecommendations(
  genres: string[],
  subgenres: string[],
  favorites: string[],
  moods: string[],
  acclaimed: string,
  timeframes: string[],
  excludeTitles: string[] = []
): Promise<MovieRecommendation[]> {
  try {

    // API key validation handled server-side in /api routes

    // Validate based on selected path
    if (genres.length === 0 && moods.length === 0) {
      throw new Error('Please select at least one genre or mood');
    }

    let retryCount = 0;
    let validRecommendations: MovieRecommendation[] = [];

    // Get watched movies to exclude - temporarily disabled for runtime stability
    // const watchedMovies = await getWatchedMovies();
    const watchedMovies: any[] = []; // Temporary stub
    const watchedTitles = new Set(watchedMovies.map(m => m.title.toLowerCase()));

    while (retryCount < MAX_RETRIES && validRecommendations.length < MOVIES_PER_BATCH) {
      try {
        // Create a set of all titles to exclude
        const titlesToExclude = new Set([
          ...previousRecommendations,
          ...favorites,
          ...excludeTitles,
          ...validRecommendations.map(r => r.title),
          ...Array.from(watchedTitles)
        ].map(title => title.toLowerCase()));

        // Convert timeframe IDs to year ranges
        const timeframeRanges = timeframes.includes('any') ? 'any release year' : timeframes.map(tf => {
          switch (tf) {
            case '1970-1989': return '1970s and 1980s';
            case '1990-1999': return '1990s';
            case '2000-2009': return '2000s';
            case '2010-2019': return '2010s';
            case '2020-present': return '2020 to present';
            default: return '';
          }
        }).join(', ');

        const remainingCount = MOVIES_PER_BATCH - validRecommendations.length;

        const prompt = `Recommend EXACTLY ${remainingCount} unique movies based on:
1. ${moods.length > 0 ? `Moods: ${moods.join(', ')}` : `Genres: ${genres.join(', ')}`}
2. ${moods.length > 0 ? '' : `Subgenres: ${subgenres.join(', ')}`}
3. Favorites: ${favorites.join(', ')}
4. Critically Acclaimed: ${acclaimed === 'yes' ? 'prioritize highly-rated films' : 'any rating'}
5. Time periods: ${timeframeRanges}

Weighting factors for recommendations:
- ${moods.length > 0 ? 'Mood' : 'Genre'} Match: ${(moods.length > 0 ? MOOD_WEIGHT : 0.30) * 100}%
- Similarity to Favorites: ${FAVORITES_WEIGHT * 100}%
- Critical Acclaim: ${ACCLAIMED_WEIGHT * 100}%
- Time Period Match: ${TIMEFRAME_WEIGHT * 100}%

CRITICAL: Exclude these movies (user has already watched or selected them):
${Array.from(titlesToExclude).join(', ')}

Return in this format:
{
  "recommendations": [
    {
      "title": "string",
      "year": number,
      "description": "string (max 200 chars)",
      "rating": "string",
      "genres": ["string"],
      "cast": ["string"],
      "director": "string",
      "rottenTomatoesScore": number,
      "imdbRating": number,
      "runtime": number,
      "matchReason": "string (max 150 chars)",
      "matchScore": number,
      "similarToFavorites": ["string"]
    }
  ]
}`;

        // TEMPORARY: Mock API response for runtime stability
        // TODO: Set up proper API routes for production
        const mockApiResponse = {
          ok: true,
          json: async () => ({
            recommendations: [
              {
                title: "Inception",
                year: 2010,
                description: "A mind-bending thriller about dreams within dreams, where a skilled thief enters people's subconscious to steal secrets.",
                rating: "PG-13",
                genres: ["Action", "Sci-Fi", "Thriller"],
                cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
                director: "Christopher Nolan",
                rottenTomatoesScore: 87,
                imdbRating: 8.8,
                runtime: 148,
                matchReason: "Complex narrative structure and mind-bending themes similar to your favorites",
                matchScore: 0.92,
                similarToFavorites: favorites.slice(0, 2)
              },
              {
                title: "The Matrix",
                year: 1999,
                description: "A computer hacker discovers reality is a simulation and joins a rebellion against the machines.",
                rating: "R",
                genres: ["Action", "Sci-Fi"],
                cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
                director: "The Wachowskis",
                rottenTomatoesScore: 88,
                imdbRating: 8.7,
                runtime: 136,
                matchReason: "Revolutionary sci-fi concepts and philosophical themes",
                matchScore: 0.89,
                similarToFavorites: favorites.slice(0, 1)
              },
              {
                title: "Blade Runner 2049",
                year: 2017,
                description: "A young blade runner discovers a secret that leads him to track down former blade runner Rick Deckard.",
                rating: "R", 
                genres: ["Sci-Fi", "Thriller", "Drama"],
                cast: ["Ryan Gosling", "Harrison Ford", "Ana de Armas"],
                director: "Denis Villeneuve",
                rottenTomatoesScore: 88,
                imdbRating: 8.0,
                runtime: 164,
                matchReason: "Visually stunning sci-fi with deep philosophical questions",
                matchScore: 0.85,
                similarToFavorites: favorites.slice(0, 1)
              },
              {
                title: "Interstellar",
                year: 2014,
                description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
                rating: "PG-13",
                genres: ["Sci-Fi", "Drama", "Adventure"],
                cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
                director: "Christopher Nolan",
                rottenTomatoesScore: 72,
                imdbRating: 8.6,
                runtime: 169,
                matchReason: "Epic space exploration with emotional depth and scientific concepts",
                matchScore: 0.83,
                similarToFavorites: favorites.slice(0, 2)
              },
              {
                title: "Ex Machina",
                year: 2014,
                description: "A young programmer is selected to participate in a breakthrough experiment in synthetic intelligence.",
                rating: "R",
                genres: ["Sci-Fi", "Thriller", "Drama"],
                cast: ["Domhnall Gleeson", "Alicia Vikander", "Oscar Isaac"],
                director: "Alex Garland",
                rottenTomatoesScore: 92,
                imdbRating: 7.7,
                runtime: 108,
                matchReason: "Intelligent AI thriller with psychological depth",
                matchScore: 0.81,
                similarToFavorites: favorites.slice(0, 1)
              }
            ].slice(0, remainingCount)
          })
        };

        // Call serverless function instead of OpenAI directly (TEMPORARILY MOCKED)
        const response = mockApiResponse; /* await fetch('/api/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            remainingCount,
            systemMessage: `You are a movie recommendation expert. Provide EXACTLY ${remainingCount} high-quality recommendations in the specified JSON format. Each recommendation must be complete with all required fields. Keep descriptions and match reasons concise. NEVER recommend movies that are in the exclusion list.${acclaimed === 'yes' ? ' Prioritize movies with high critic scores (>80% on Rotten Tomatoes, >7.5 on IMDb) or significant award recognition.' : ''}`,
            prompt,
            model: "gpt-4-turbo-preview",
            temperature: 0.7,
            max_tokens: 4000
          })
        }); */

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const apiData = await response.json();
        if (apiData.error) {
          throw new Error(apiData.error);
        }

        const content = apiData.content;
        if (!content) {
          throw new Error('No content received from AI service');
        }

        let data;
        try {
          data = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', content);
          throw new Error('Invalid response format from AI. Please try again.');
        }

        if (!data.recommendations || !Array.isArray(data.recommendations)) {
          throw new Error('Invalid recommendations format received');
        }

        if (data.recommendations.length === 0) {
          throw new Error('No recommendations received from AI');
        }

        if (data.recommendations.length !== remainingCount) {
          throw new Error(`Received ${data.recommendations.length} recommendations, expected ${remainingCount}`);
        }

        // Validate and process recommendations
        const newRecommendations = await Promise.all(
          data.recommendations
            .filter(movie => {
              // Basic validation
              if (!movie.title || !movie.year || !movie.description) {
                console.warn('Skipping invalid movie:', movie);
                return false;
              }

              // Ensure movie hasn't been recommended before or watched
              const movieTitle = movie.title.toLowerCase();
              if (titlesToExclude.has(movieTitle)) {
                console.warn('Skipping previously recommended or watched movie:', movie.title);
                return false;
              }

              // Validate time period if specific timeframes are selected
              if (!timeframes.includes('any')) {
                const movieYear = movie.year;
                const isInTimeframe = timeframes.some(tf => {
                  switch (tf) {
                    case '1970-1989': return movieYear >= 1967 && movieYear <= 1992;
                    case '1990-1999': return movieYear >= 1987 && movieYear <= 2002;
                    case '2000-2009': return movieYear >= 1997 && movieYear <= 2012;
                    case '2010-2019': return movieYear >= 2007 && movieYear <= 2022;
                    case '2020-present': return movieYear >= 2017;
                    default: return false;
                  }
                });

                if (!isInTimeframe) {
                  console.warn('Skipping movie outside timeframe:', movie.title, movieYear);
                  return false;
                }
              }

              return true;
            })
            .map(async movie => {
              previousRecommendations.add(movie.title.toLowerCase());

              const movieGenres = Array.isArray(movie.genres) 
                ? movie.genres 
                : movie.genres ? [movie.genres] : [];

              const movieCast = Array.isArray(movie.cast) 
                ? movie.cast 
                : movie.cast ? [movie.cast] : [];

              const similarToFavorites = Array.isArray(movie.similarToFavorites)
                ? movie.similarToFavorites
                : movie.similarToFavorites ? [movie.similarToFavorites] : [];

              const { url: posterUrl, tmdbId } = await getMoviePoster(movie.title, movie.year);

              return {
                title: movie.title,
                year: movie.year,
                description: movie.description,
                rating: movie.rating || 'Not Rated',
                genres: movieGenres,
                cast: movieCast,
                director: movie.director || 'Unknown',
                rottenTomatoesScore: movie.rottenTomatoesScore,
                imdbRating: movie.imdbRating,
                runtime: movie.runtime,
                posterUrl: posterUrl || 'https://via.placeholder.com/500x750?text=No+Poster',
                matchReason: movie.matchReason || 'Matches your selected preferences',
                matchScore: typeof movie.matchScore === 'number' ? movie.matchScore : 0,
                similarToFavorites,
                tmdbId
              };
            })
        );

        validRecommendations = [...validRecommendations, ...newRecommendations];

        if (validRecommendations.length < MOVIES_PER_BATCH) {
          retryCount++;
          continue;
        }

        return validRecommendations.sort((a, b) => b.matchScore - a.matchScore);
      } catch (error) {
        console.error('Error getting movie recommendations:', error);
        retryCount++;
        
        if (retryCount >= MAX_RETRIES) {
          if (validRecommendations.length > 0) {
            return validRecommendations.sort((a, b) => b.matchScore - a.matchScore);
          }
          
          if (error instanceof Error) {
            if (error.message.includes('API key')) {
              throw new Error('The AI service is not properly configured. Please try again later or contact support.');
            }
            if (error.message.includes('rate limit')) {
              throw new Error('Too many requests. Please try again in a moment.');
            }
            throw error;
          }
          
          throw new Error('Failed to get movie recommendations. Please try again.');
        }
      }
    }

    return validRecommendations;
  } catch (err) {
    console.error('Error getting movie recommendations:', err);
    throw err;
  }
}

export async function getNextConversationPrompt(
  currentStep: string,
  previousSelections: Record<string, any>
): Promise<string> {
  try {
    const prompt = `Based on the current conversation step "${currentStep}" and the user's previous selections ${JSON.stringify(previousSelections)}, generate the next natural conversation prompt for the movie recommendation process.`;

    const response = await fetch('/api/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemMessage: "You are a friendly movie expert guiding users through a conversation to find their perfect movie match.",
        prompt,
        model: "gpt-4-turbo-preview",
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const apiData = await response.json();
    if (apiData.error) {
      throw new Error(apiData.error);
    }

    const content = apiData.content;
    if (!content) {
      throw new Error('No conversation prompt received from AI service');
    }

    return content;
  } catch (error) {
    console.error('Error getting conversation prompt:', error);
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('The AI service is not properly configured. Please try again later or contact support.');
      }
      throw error;
    }
    throw new Error('Failed to generate conversation prompt. Please try again.');
  }
}