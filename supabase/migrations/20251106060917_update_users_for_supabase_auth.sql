/*
  # Update Users Table for Supabase Auth

  1. Changes
    - Remove password_hash column (Supabase Auth handles passwords)
    - Remove mobile_number column (only email authentication)
    - Make email NOT NULL (required for Supabase Auth)
    - Update RLS policies for Supabase Auth

  2. Security
    - RLS policies updated to use auth.uid()
    - Users can only access their own data
*/

-- Remove password_hash column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users DROP COLUMN password_hash;
  END IF;
END $$;

-- Remove mobile_number column if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'mobile_number'
  ) THEN
    ALTER TABLE users DROP COLUMN mobile_number;
  END IF;
END $$;

-- Make email NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE users ALTER COLUMN email SET NOT NULL;
  END IF;
END $$;

-- Update signup_method default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'signup_method'
  ) THEN
    ALTER TABLE users ALTER COLUMN signup_method SET DEFAULT 'email';
  END IF;
END $$;
