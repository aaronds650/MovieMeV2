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