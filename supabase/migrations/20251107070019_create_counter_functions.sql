/*
  # Create Database Functions for Counter Management

  1. **Functions Created**
    - increment_video_likes: Increments likes count on videos
    - decrement_video_likes: Decrements likes count on videos
    - increment_video_comments: Increments comments count on videos
    - increment_video_views: Increments views count on videos
    - increment_follower_counts: Updates follower/following counts when following
    - decrement_follower_counts: Updates follower/following counts when unfollowing

  2. **Security**
    - Functions use SECURITY DEFINER to bypass RLS for counter updates
    - Only increment/decrement operations allowed (no direct manipulation)
    - Ensures counts never go below zero

  3. **Notes**
    - Atomic operations for data consistency
    - Safe concurrent access
    - Prevents race conditions
*/

-- Function to increment video likes
CREATE OR REPLACE FUNCTION increment_video_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE videos
  SET likes = likes + 1
  WHERE id = video_id;
END;
$$;

-- Function to decrement video likes
CREATE OR REPLACE FUNCTION decrement_video_likes(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE videos
  SET likes = GREATEST(likes - 1, 0)
  WHERE id = video_id;
END;
$$;

-- Function to increment video comments
CREATE OR REPLACE FUNCTION increment_video_comments(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE videos
  SET comments_count = comments_count + 1
  WHERE id = video_id;
END;
$$;

-- Function to increment video views
CREATE OR REPLACE FUNCTION increment_video_views(video_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE videos
  SET views = views + 1
  WHERE id = video_id;
END;
$$;

-- Function to increment follower counts
CREATE OR REPLACE FUNCTION increment_follower_counts(
  follower_user_id uuid,
  following_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET following_count = following_count + 1
  WHERE id = follower_user_id;
  
  UPDATE users
  SET follower_count = follower_count + 1
  WHERE id = following_user_id;
END;
$$;

-- Function to decrement follower counts
CREATE OR REPLACE FUNCTION decrement_follower_counts(
  follower_user_id uuid,
  following_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE users
  SET following_count = GREATEST(following_count - 1, 0)
  WHERE id = follower_user_id;
  
  UPDATE users
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = following_user_id;
END;
$$;
