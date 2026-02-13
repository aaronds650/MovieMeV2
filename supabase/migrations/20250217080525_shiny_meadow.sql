/*
  # Fix Movies Table Cast Column

  1. Changes
    - Rename cast_members to cast_list to avoid reserved word conflicts
    - Add NOT NULL constraints for required fields
    - Add check constraints for data validation
    - Add performance indexes

  2. Data Integrity
    - Year must be between 1888 and current year + 5
    - Rating must be a valid movie/TV rating
*/

-- Rename cast_members to cast_list if it exists, otherwise add cast_list column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movies' AND column_name = 'cast_members'
  ) THEN
    ALTER TABLE movies RENAME COLUMN cast_members TO cast_list;
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movies' AND column_name = 'cast_list'
  ) THEN
    ALTER TABLE movies ADD COLUMN cast_list text[];
  END IF;
END $$;

-- Add NOT NULL constraints
ALTER TABLE movies 
  ALTER COLUMN title SET NOT NULL,
  ALTER COLUMN year SET NOT NULL,
  ALTER COLUMN description SET NOT NULL;

-- Add check constraints
ALTER TABLE movies 
  ADD CONSTRAINT year_check CHECK (year >= 1888 AND year <= extract(year from current_date) + 5),
  ADD CONSTRAINT rating_check CHECK (rating IS NULL OR rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA', 'NR', 'Not Rated'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_genres ON movies USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_movies_cast_list ON movies USING gin(cast_list);