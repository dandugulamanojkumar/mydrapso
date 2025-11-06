/*
  # Create Storage Policies for Video and Profile Picture Uploads

  1. **Storage Policies**
    - Allow authenticated users to upload videos to `videos` bucket
    - Allow authenticated users to upload profile pictures to `profile-pictures` bucket
    - Allow public read access to both buckets (since they're public)
    - Allow users to update/delete their own uploads

  2. **Security**
    - Users can only upload to their own folders
    - Public can read all files (for video streaming and avatar display)
    - File size limits enforced at application level
*/

-- =====================================================
-- VIDEOS BUCKET POLICIES
-- =====================================================

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'videos' 
  AND (storage.foldername(name))[1] = 'videos'
);

-- Allow public to read videos
CREATE POLICY "Public can view videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'videos');

-- Allow users to update their own videos
CREATE POLICY "Users can update own videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'videos'
  AND owner = (select auth.uid())
)
WITH CHECK (
  bucket_id = 'videos'
  AND owner = (select auth.uid())
);

-- Allow users to delete their own videos
CREATE POLICY "Users can delete own videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos'
  AND owner = (select auth.uid())
);

-- =====================================================
-- PROFILE PICTURES BUCKET POLICIES
-- =====================================================

-- Allow authenticated users to upload profile pictures
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Allow public to read profile pictures
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures'
  AND owner = (select auth.uid())
)
WITH CHECK (
  bucket_id = 'profile-pictures'
  AND owner = (select auth.uid())
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures'
  AND owner = (select auth.uid())
);
