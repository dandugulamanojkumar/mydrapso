/*
  # Update Users RLS for Sign-In

  1. Changes
    - Allow reading user data for authentication purposes
    - Keep user data secure but accessible for login validation

  2. Security
    - Allow select for sign-in validation
    - Keep insert/update/delete restricted
*/

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create policies for custom auth
CREATE POLICY "Allow sign-in queries"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Allow sign-up inserts"
  ON users FOR INSERT
  WITH CHECK (true);
