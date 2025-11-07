/*
  # Fix Users Table RLS for Signup

  1. **Changes**
    - Drop all existing policies to start fresh
    - Create policy to allow authenticated users to insert their own profile
    - Create policy to allow anyone to read profiles
    - Create policy to allow users to update their own profile
    - Create policy to allow users to delete their own profile

  2. **Security**
    - Users can only insert records with their own auth.uid()
    - All users can read profiles (needed for app functionality)
    - Users can only update/delete their own records
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON users;
DROP POLICY IF EXISTS "Anyone can view user profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own profile" ON users;
DROP POLICY IF EXISTS "Allow authenticated signup" ON users;
DROP POLICY IF EXISTS "Allow anonymous authentication queries" ON users;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON users;
DROP POLICY IF EXISTS "Allow anyone to read profiles" ON users;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own record
CREATE POLICY "Allow users to insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow anyone to read all profiles
CREATE POLICY "Allow anyone to read profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete only their own profile
CREATE POLICY "Allow users to delete their own profile"
  ON users FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
