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