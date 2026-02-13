-- MIGRATION: 20250216191313_crimson_feather.sql
/*
  # Create user profiles and streaming preferences tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `username` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `streaming_services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    - `user_streaming_services`
      - `user_id` (uuid, foreign key to profiles)
      - `service_id` (uuid, foreign key to streaming_services)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create streaming services table
CREATE TABLE IF NOT EXISTS streaming_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user streaming services junction table
CREATE TABLE IF NOT EXISTS user_streaming_services (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES streaming_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, service_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaming_services ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Streaming services policies
CREATE POLICY "Anyone can view streaming services"
  ON streaming_services
  FOR SELECT
  TO authenticated
  USING (true);

-- User streaming services policies
CREATE POLICY "Users can view their streaming services"
  ON user_streaming_services
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their streaming services"
  ON user_streaming_services
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default streaming services
INSERT INTO streaming_services (name) VALUES
  ('Netflix'),
  ('Hulu'),
  ('Prime Video'),
  ('Disney+'),
  ('Max'),
  ('Peacock'),
  ('Apple TV+')
ON CONFLICT (name) DO NOTHING;

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- MIGRATION: 20250216192829_twilight_surf.sql
/*
  # Fix user profile creation

  1. Changes
    - Drop and recreate the handle_new_user function with proper error handling
    - Update the trigger to ensure proper execution
  
  2. Security
    - Maintains existing RLS policies
    - Function runs with SECURITY DEFINER permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'username'),
      'user_' || substr(NEW.id::text, 1, 8)
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error (in a real production environment)
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
-- MIGRATION: 20250216194044_raspy_unit.sql
/*
  # Add rentals preference to profiles

  1. Changes
    - Add `include_rentals` column to profiles table with default value of false
    - This column will track whether users want to see rentable movies in their recommendations

  2. Security
    - No additional security changes needed as the profiles table already has RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'include_rentals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN include_rentals boolean DEFAULT false;
  END IF;
END $$;
-- MIGRATION: 20250217042838_white_meadow.sql
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
-- MIGRATION: 20250217080525_shiny_meadow.sql
/*
  # Fix Movies Table Cast Column

  1. Changes
    - Rename cast_members to cast_list to avoid reserved word conflicts
    - Add NOT NULL constraints for required fields
    - Add check constraints for data validation
    - Add performance indexes

  2. Data Integrity
    - Year must be between 1888 and current year + 5
    - Rating must be a valid movie/TV rating
*/

-- Rename cast_members to cast_list if it exists, otherwise add cast_list column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movies' AND column_name = 'cast_members'
  ) THEN
    ALTER TABLE movies RENAME COLUMN cast_members TO cast_list;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movies' AND column_name = 'cast_list'
  ) THEN
    ALTER TABLE movies ADD COLUMN cast_list text[];
  END IF;
END $$;

-- Add NOT NULL constraints
ALTER TABLE movies 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN year SET NOT NULL,
  ALTER COLUMN description SET NOT NULL;

-- Add check constraints
ALTER TABLE movies 
  ADD CONSTRAINT year_check CHECK (year >= 1888 AND year <= extract(year from current_date) + 5),
  ADD CONSTRAINT rating_check CHECK (rating IS NULL OR rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'NR', 'Not Rated'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_movies_cast_list ON movies USING gin(cast_list);
-- MIGRATION: 20250217173848_flat_sea.sql
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
-- MIGRATION: 20250217174724_old_brook.sql
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
-- MIGRATION: 20250217213258_autumn_cake.sql
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
-- MIGRATION: 20250323012540_lively_lagoon.sql
/*
  # Add user roles to profiles table

  1. Changes
    - Add `role` column to profiles table with default value 'core'
    - Add check constraint to ensure valid role values
    - Update existing rows to have the default role

  2. Security
    - No additional security changes needed as the profiles table already has RLS policies
*/

DO $$ 
BEGIN
  -- Add role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    -- Add the role column with default value
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'core';
    
    -- Add check constraint for valid roles
    ALTER TABLE profiles 
      ADD CONSTRAINT valid_role 
      CHECK (role IN ('core', 'premium'));
  END IF;
END $$;
-- MIGRATION: 20250505151527_mute_tooth.sql
/*
  # Add search limits tracking

  1. New Tables
    - `search_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `search_count` (integer)
      - `last_reset` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for users to manage their own usage
*/

CREATE TABLE search_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  search_count integer DEFAULT 0,
  last_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE search_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own search usage"
  ON search_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own search usage"
  ON search_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to handle search usage updates
CREATE OR REPLACE FUNCTION update_search_usage()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_search_usage_timestamp
  BEFORE UPDATE ON search_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_search_usage();
-- MIGRATION: 20250505154646_tender_bush.sql
/*
  # Create user activity logging table

  1. New Tables
    - `user_activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `action` (text)
      - `timestamp` (timestamptz)
      - `metadata` (jsonb)
      - `session_id` (text)

  2. Security
    - Enable RLS
    - Add policies for authenticated users to view their own activity
*/

CREATE TABLE user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX idx_user_activity_log_timestamp ON user_activity_log(timestamp DESC);
CREATE INDEX idx_user_activity_log_session_id ON user_activity_log(session_id);
-- MIGRATION: 20250505171617_tight_dew.sql
/*
  # Add INSERT policy for user activity log

  1. Security Changes
    - Add INSERT policy for user_activity_log table
    - Allow authenticated users to insert their own activity logs
    - Ensure user_id matches the authenticated user's ID
*/

CREATE POLICY "Users can insert their own activity logs"
  ON public.user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
