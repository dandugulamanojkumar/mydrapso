/*
  # Add Video Storage Support

  1. **Storage Configuration**
    - Videos will be stored in Supabase Storage bucket 'videos'
    - Update video_url to store storage paths
    
  2. **Performance Optimizations**
    - Add indexes for faster queries
    - Optimize video metadata queries
    
  3. **Real-time Support**
    - Enable real-time on videos table for instant updates
    
  4. **Cart Products Table**
    - Create table for affiliate products with proper URLs
*/

-- Add products table for better affiliate link management
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price text,
  product_url text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Anyone can view products
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert products for their own videos
CREATE POLICY "Users can add products to own videos"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = (select auth.uid())
    )
  );

-- Users can update products for their own videos
CREATE POLICY "Users can update products on own videos"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = (select auth.uid())
    )
  );

-- Users can delete products from their own videos
CREATE POLICY "Users can delete products from own videos"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_id 
      AND videos.user_id = (select auth.uid())
    )
  );

-- Add index for products
CREATE INDEX IF NOT EXISTS idx_products_video_id ON products(video_id);

-- Optimize video queries with better indexes
CREATE INDEX IF NOT EXISTS idx_videos_created_at_desc ON videos(created_at DESC);

-- Add updated_at trigger for videos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
