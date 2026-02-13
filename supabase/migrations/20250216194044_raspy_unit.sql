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