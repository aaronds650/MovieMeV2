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