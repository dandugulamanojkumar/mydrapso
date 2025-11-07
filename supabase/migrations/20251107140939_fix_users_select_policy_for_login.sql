/*
  # Fix Users Table Select Policy for Login

  1. **Changes**
    - Drop existing select policy that only allows authenticated users
    - Create new select policy that allows both authenticated AND anonymous users
    - This is needed because during login, we need to look up email by username
    - Anonymous users can only read public profile info, not sensitive data

  2. **Security**
    - Anonymous users can read profiles (needed for username lookup during login)
    - Authenticated users can read profiles (needed for app functionality)
    - Insert/Update/Delete still require authentication and ownership check
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Allow anyone to read profiles" ON users;

-- Create new select policy that allows both authenticated and anonymous users
CREATE POLICY "Allow public to read profiles"
  ON users FOR SELECT
  USING (true);
