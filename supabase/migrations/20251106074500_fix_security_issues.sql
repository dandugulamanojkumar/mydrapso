/*
  # Fix Security and Performance Issues

  1. **Add Missing Indexes**
    - Add index on `notifications.actor_id` (foreign key to users)
    - Add index on `notifications.comment_id` (foreign key to comments)
    - Add index on `notifications.video_id` (foreign key to videos)

  2. **Remove Duplicate Indexes**
    - Drop `idx_comments_video_id` (duplicate of `comments_video_id_idx`)
    - Drop `idx_videos_user_id` (duplicate of `videos_user_id_idx`)

  3. **Remove Unused Indexes**
    - Drop `comments_created_at_idx` (not used)
    - Drop `idx_follows_following` (not used)
    - Drop `idx_notifications_user` (not used)

  4. **Optimize RLS Policies**
    - Replace `auth.uid()` with `(select auth.uid())` in all policies
    - This prevents re-evaluation for each row, improving performance

  5. **Remove Duplicate Permissive Policies**
    - Keep only necessary policies for anon and authenticated roles
    - Remove redundant policies

  6. **Fix Function Security**
    - Set stable search_path for trigger functions
*/

-- =====================================================
-- 1. ADD MISSING INDEXES ON FOREIGN KEYS
-- =====================================================

-- Index for notifications.actor_id
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id 
  ON notifications(actor_id);

-- Index for notifications.comment_id
CREATE INDEX IF NOT EXISTS idx_notifications_comment_id 
  ON notifications(comment_id);

-- Index for notifications.video_id (if it doesn't already exist)
CREATE INDEX IF NOT EXISTS idx_notifications_video_id 
  ON notifications(video_id);

-- =====================================================
-- 2. REMOVE DUPLICATE INDEXES
-- =====================================================

-- Drop duplicate comment video index
DROP INDEX IF EXISTS idx_comments_video_id;

-- Drop duplicate video user index
DROP INDEX IF EXISTS idx_videos_user_id;

-- =====================================================
-- 3. REMOVE UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS comments_created_at_idx;
DROP INDEX IF EXISTS idx_follows_following;
DROP INDEX IF EXISTS idx_notifications_user;

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - USERS TABLE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow sign-in queries" ON users;
DROP POLICY IF EXISTS "Allow public read for verification" ON users;
DROP POLICY IF EXISTS "Allow public insert for registration" ON users;
DROP POLICY IF EXISTS "Allow sign-up inserts" ON users;

-- Recreate optimized policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Single anon policy for registration
CREATE POLICY "Allow user registration"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- Single anon policy for sign-in queries
CREATE POLICY "Allow authentication queries"
  ON users FOR SELECT
  TO anon
  USING (true);

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - LIKES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can create their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Users can create their own likes"
  ON likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own likes"
  ON likes FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - FOLLOWS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can create their own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

CREATE POLICY "Users can create their own follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = (select auth.uid()));

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (follower_id = (select auth.uid()));

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - NOTIFICATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 8. FIX FUNCTION SEARCH_PATH SECURITY
-- =====================================================

-- Recreate trigger functions with stable search_path
CREATE OR REPLACE FUNCTION update_video_like_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE videos
    SET likes = likes + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE videos
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE users SET follower_count = follower_count + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
    UPDATE users SET follower_count = GREATEST(0, follower_count - 1) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Ensure triggers exist (recreate if needed)
DROP TRIGGER IF EXISTS update_video_like_count_trigger ON likes;
CREATE TRIGGER update_video_like_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_video_like_count();

DROP TRIGGER IF EXISTS update_follow_counts_trigger ON follows;
CREATE TRIGGER update_follow_counts_trigger
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_counts();
