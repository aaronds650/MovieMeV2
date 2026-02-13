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