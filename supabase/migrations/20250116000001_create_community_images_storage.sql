-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images',
  'community-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload community images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'community-images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'community'
);

-- Create storage policy to allow public read access to community images
CREATE POLICY "Allow public read access to community images" ON storage.objects
FOR SELECT USING (bucket_id = 'community-images');

-- Create storage policy to allow users to delete their own images
CREATE POLICY "Allow users to delete their own community images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'community-images'
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow users to update their own images
CREATE POLICY "Allow users to update their own community images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'community-images'
  AND auth.role() = 'authenticated'
);
