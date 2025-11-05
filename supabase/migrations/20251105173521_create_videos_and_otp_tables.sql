/*
  # Create Videos and OTP Tables

  1. New Tables
    - `videos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `video_url` (text) - URL to video file
      - `thumbnail_url` (text) - URL to thumbnail
      - `duration` (integer) - duration in seconds
      - `views` (integer, default 0)
      - `likes` (integer, default 0)
      - `has_affiliate` (boolean, default false)
      - `affiliate_link` (text, nullable)
      - `has_location` (boolean, default false)
      - `location` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `otp_verifications`
      - `id` (uuid, primary key)
      - `contact` (text) - email or mobile number
      - `otp_code` (text)
      - `method` (text) - 'email' or 'mobile'
      - `expires_at` (timestamptz)
      - `verified` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Videos: Users can read all, but only insert/update/delete their own
    - OTP: No direct access (handled via edge functions)
*/

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer NOT NULL DEFAULT 0,
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  has_affiliate boolean NOT NULL DEFAULT false,
  affiliate_link text,
  has_location boolean NOT NULL DEFAULT false,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact text NOT NULL,
  otp_code text NOT NULL,
  method text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Anyone can view videos"
  ON videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- OTP policies (no direct access - managed by edge functions only)
CREATE POLICY "No direct OTP access"
  ON otp_verifications FOR ALL
  TO authenticated
  USING (false);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS videos_user_id_idx ON videos(user_id);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS otp_contact_idx ON otp_verifications(contact);
CREATE INDEX IF NOT EXISTS otp_expires_at_idx ON otp_verifications(expires_at);
