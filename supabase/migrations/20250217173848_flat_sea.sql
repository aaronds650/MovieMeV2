/*
  # Create watchlist table

  1. New Tables
    - `watchlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tmdb_id` (integer, TMDB movie ID)
      - `title` (text, movie title)
      - `year` (integer, release year)
      - `poster_url` (text, movie poster URL)
      - `overview` (text, movie description)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `watchlist` table
    - Add policies for authenticated users to manage their watchlist
*/

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id integer NOT NULL,
  title text NOT NULL,
  year integer NOT NULL,
  poster_url text,
  overview text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watchlist"
  ON watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist"
  ON watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist"
  ON watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);