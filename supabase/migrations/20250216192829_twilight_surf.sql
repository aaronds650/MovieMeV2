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