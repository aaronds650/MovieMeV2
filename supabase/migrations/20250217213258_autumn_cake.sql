/*
  # Add Watched Movies Feature

  1. New Tables
    - `watched_movies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tmdb_id` (integer)
      - `title` (text)
      - `year` (integer)
      - `poster_url` (text)
      - `overview` (text)
      - `watched_at` (timestamptz)
      - `rating` (integer, optional)
      - `review` (text, optional)

  2. Security
    - Enable RLS on `watched_movies` table
    - Add policies for authenticated users to manage their watched movies
*/

-- Create watched movies table
CREATE TABLE watched_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id integer NOT NULL,
  title text NOT NULL,
  year integer NOT NULL,
  poster_url text,
  overview text,
  watched_at timestamptz DEFAULT now(),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  -- Add unique constraint to prevent duplicate entries
  UNIQUE(user_id, tmdb_id)
);

-- Enable RLS
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watched movies"
  ON watched_movies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watched movies"
  ON watched_movies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watched movies"
  ON watched_movies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watched movies"
  ON watched_movies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_tmdb_id ON watched_movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_watched_at ON watched_movies(watched_at DESC);