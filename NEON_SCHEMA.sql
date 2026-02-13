-- MovieMe PostgreSQL Schema for Neon
-- Run this in Neon SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (App-provided IDs)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'core' CHECK (role IN ('core', 'premium')),
  include_rentals BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaming services
CREATE TABLE IF NOT EXISTS streaming_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User streaming services junction
CREATE TABLE IF NOT EXISTS user_streaming_services (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES streaming_services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, service_id)
);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  poster_url TEXT,
  overview TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- Watched movies
CREATE TABLE IF NOT EXISTS watched_movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  year INTEGER,
  poster_url TEXT,
  overview TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tmdb_id)
);

-- User activity log (Fixed to reference profiles)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search limits
CREATE TABLE IF NOT EXISTS user_search_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  searches_today INTEGER DEFAULT 0,
  last_search_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tmdb_id ON watchlist(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_user_id ON watched_movies(user_id);
CREATE INDEX IF NOT EXISTS idx_watched_movies_tmdb_id ON watched_movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_action ON user_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_timestamp ON user_activity_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_search_limits_user_id ON user_search_limits(user_id);

-- Seed data - streaming services
INSERT INTO streaming_services (name) VALUES
  ('Netflix'),
  ('Hulu'), 
  ('Prime Video'),
  ('Disney+'),
  ('Max'),
  ('Peacock'),
  ('Apple TV+')
ON CONFLICT (name) DO NOTHING;