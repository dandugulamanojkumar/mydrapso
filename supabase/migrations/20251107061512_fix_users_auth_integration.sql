/*
  # Fix Users Table to Integrate with Supabase Auth

  1. **Schema Updates**
    - Remove default UUID generator from id (must match auth.users.id)
    - Ensure username is unique
    - Add proper constraints

  2. **Security**
    - Update RLS policies for proper auth integration
    - Allow users to read their own data
    - Allow signup to insert new users

  3. **Notes**
    - Users table id must match auth.users.id exactly
    - Email and username are unique identifiers for login
*/

-- Drop existing default on id column
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;

-- Ensure username is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- Ensure email is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Allow signup to insert users" ON users;
DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;

-- Create new policies for auth integration
CREATE POLICY "Anyone can view user profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert during signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create helper function to get email from username
CREATE OR REPLACE FUNCTION get_email_from_username(username_input text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM users WHERE username = username_input LIMIT 1;
$$;
