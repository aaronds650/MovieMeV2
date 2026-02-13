-- MovieMe Database Setup - All Migrations Consolidated
-- Execute this entire file in Supabase SQL Editor

-- MIGRATION 1: 20250216191313_crimson_feather.sql
-- Create user profiles and streaming preferences tables
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS streaming_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

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
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Streaming services policies
CREATE POLICY "Anyone can view streaming services"
  ON streaming_services FOR SELECT TO authenticated
  USING (true);

-- User streaming services policies
CREATE POLICY "Users can view their streaming services"
  ON user_streaming_services FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their streaming services"
  ON user_streaming_services FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Insert default streaming services
INSERT INTO streaming_services (name) VALUES
  ('Netflix'), ('Hulu'), ('Prime Video'), ('Disney+'), ('Max'), ('Peacock'), ('Apple TV+')
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

-- MIGRATION 2: 20250216192829_twilight_surf.sql
-- Fix user profile creation with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

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
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- MIGRATION 3: 20250216194044_raspy_unit.sql  
-- Add rentals preference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'include_rentals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN include_rentals boolean DEFAULT false;
  END IF;
END $$;

-- MIGRATION 4: 20250217042838_white_meadow.sql
-- Add Movie Lists and Watched Movies
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

CREATE TABLE IF NOT EXISTS user_favorites (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS user_watched (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  movie_id uuid REFERENCES movies(id) ON DELETE CASCADE,
  watched_at timestamptz DEFAULT now(),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  PRIMARY KEY (user_id, movie_id)
);

-- Enable RLS  
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watched ENABLE ROW LEVEL SECURITY;

-- Movies policies
CREATE POLICY "Anyone can view movies" ON movies FOR SELECT TO authenticated USING (true);

-- User favorites policies
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);  
CREATE POLICY "Users can remove their favorites" ON user_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User watched policies
CREATE POLICY "Users can view their watched movies" ON user_watched FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add watched movies" ON user_watched FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their watched movies" ON user_watched FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can remove their watched movies" ON user_watched FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_watched_user_id ON user_watched(user_id);