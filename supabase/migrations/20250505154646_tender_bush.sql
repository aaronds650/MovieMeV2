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