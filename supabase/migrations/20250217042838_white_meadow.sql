/*
  # Add Movie Lists and Watched Movies

  1. New Tables
    - `movies`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `year` (integer)
      - `description` (text)
      - `poster_url` (text)
      - `rating` (text)
      - `director` (text)
      - `cast_members` (text[])
      - `genres` (text[])
      - `created_at` (timestamptz)

    - `user_favorites`
      - `user_id` (uuid, references profiles)
      - `movie_id` (uuid, references movies)
      - `added_at` (timestamptz)
      - Primary key: (user_id, movie_id)

    - `user_watched`
      - `user_id` (uuid, references profiles)
      - `movie_id` (uuid, references movies)
      - `watched_at` (timestamptz)
      - `rating` (integer, 1-5)
      - `review` (text)
      - Primary key: (user_id, movie_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read their own favorites and watched movies
      - Add/remove movies from their lists
      - View movie details if they have access to the movie
*/

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  year integer,
  description text,
  poster_url text,
  rating text,
  director text,
  cast_members text[],
  genres text[],
  created_at timestamptz DEFAULT now()
);

-- Create user favorites junction table
CREATE TABLE IF NOT EXISTS user_favorites (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

-- Create user watched movies table
CREATE TABLE IF NOT EXISTS user_watched (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  watched_at timestamptz DEFAULT now(),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  PRIMARY KEY (user_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watched ENABLE ROW LEVEL SECURITY;

-- Movies policies
CREATE POLICY "Anyone can view movies"
  ON movies
  FOR SELECT
  TO authenticated
  USING (true);

-- User favorites policies
CREATE POLICY "Users can view their own favorites"
  ON user_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON user_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User watched policies
CREATE POLICY "Users can view their watched movies"
  ON user_watched
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add watched movies"
  ON user_watched
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watched movies"
  ON user_watched
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their watched movies"
  ON user_watched
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watched_user_id ON user_watched(user_id);