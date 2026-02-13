-- Drop existing watchlist table if it exists
DROP TABLE IF EXISTS watchlist;

-- Create watchlist table with proper constraints
CREATE TABLE watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id integer NOT NULL,
  title text NOT NULL,
  year integer NOT NULL,
  poster_url text,
  overview text,
  created_at timestamptz DEFAULT now(),
  -- Add unique constraint to prevent duplicate entries
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_created_at ON watchlist(created_at DESC);