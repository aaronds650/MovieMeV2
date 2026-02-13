-- MovieMe Database Complete Setup
-- Copy and paste this entire script into Supabase SQL Editor

-- ===========================================
-- MIGRATION 1: Core Tables & Streaming Services 
-- ===========================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  role text DEFAULT 'core' CHECK (role IN ('core', 'premium')),
  include_rentals boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Streaming services
CREATE TABLE IF NOT EXISTS streaming_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User streaming services junction
CREATE TABLE IF NOT EXISTS user_streaming_services (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  service_id uuid REFERENCES streaming_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, service_id)
);

-- Watchlist table (simplified from movies + user_favorites structure)
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id integer NOT NULL,
  title text NOT NULL,
  year integer,
  poster_url text,
  overview text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);

-- Watched movies table 
CREATE TABLE IF NOT EXISTS watched_movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tmdb_id integer NOT NULL,
  title text NOT NULL,
  year integer,
  poster_url text,
  overview text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  review text,
  watched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tmdb_id)
);

-- User activity logging
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Search limits table for premium gating
CREATE TABLE IF NOT EXISTS user_search_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  searches_today integer DEFAULT 0,
  last_search_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- ===========================================
-- ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaming_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaming_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_limits ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- ROW LEVEL SECURITY POLICIES
-- ===========================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Streaming services policies  
CREATE POLICY "Anyone can view streaming services" ON streaming_services FOR SELECT TO authenticated USING (true);

-- User streaming services policies
CREATE POLICY "Users can view their streaming services" ON user_streaming_services FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their streaming services" ON user_streaming_services FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Watchlist policies
CREATE POLICY "Users can view their watchlist" ON watchlist FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their watchlist" ON watchlist FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Watched movies policies
CREATE POLICY "Users can view their watched movies" ON watched_movies FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their watched movies" ON watched_movies FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view their own activity" ON user_activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activity logs" ON user_activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Search limits policies
CREATE POLICY "Users can view their search limits" ON user_search_limits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their search limits" ON user_search_limits FOR ALL TO authenticated USING (auth.uid() = user_id);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_tmdb_id ON watched_movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_timestamp ON user_activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_session_id ON user_activity_log(session_id);
CREATE INDEX IF NOT EXISTS idx_user_search_limits_user_id ON user_search_limits(user_id);

-- ===========================================
-- SEED DATA
-- ===========================================

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

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(
      (NEW.raw_user_meta_data->>'username'),
      (NEW.raw_user_meta_data->>'name'), 
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Uncomment these to verify setup after running the migration:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- SELECT COUNT(*) as streaming_services_count FROM streaming_services;
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';