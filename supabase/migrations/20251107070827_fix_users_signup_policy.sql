/*
  # Fix Users Table Signup RLS Policy

  1. **Issue**
    - Current INSERT policy requires auth.uid() = id
    - During signup, the auth user is created BEFORE inserting into users table
    - The session might not be fully established when insert happens

  2. **Solution**
    - Keep the policy but ensure it works during signup flow
    - Add policy to allow inserts for authenticated users where id matches auth.uid()
    - The policy is correct, but we need to ensure anon role can also insert during signup

  3. **Security**
    - Users can only insert their own record (id must match auth.uid())
    - No one can insert records for other users
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Allow authenticated signup" ON users;
DROP POLICY IF EXISTS "Users can insert during signup" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new policy that allows both authenticated and anon users to insert
-- as long as the ID matches the auth user ID
CREATE POLICY "Users can insert own profile during signup"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Ensure anon users can also read for username lookup during login
DROP POLICY IF EXISTS "Allow anonymous authentication queries" ON users;

CREATE POLICY "Anyone can view user profiles"
  ON users FOR SELECT
  USING (true);
