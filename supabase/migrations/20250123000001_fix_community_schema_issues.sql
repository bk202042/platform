-- Fix Community Schema Issues
-- This migration addresses the authentication and schema inconsistencies

-- 1. Add missing status column to community_posts
ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published'
CHECK (status IN ('draft', 'published', 'archived'));

-- 2. Update existing posts to have published status
UPDATE public.community_posts
SET status = 'published'
WHERE status IS NULL;

-- 3. Fix foreign key relationship for community_posts.user_id
-- First, let's check if we need to update the foreign key constraint
-- The current setup references auth.users(id) but we want to reference profiles(id)

-- Drop existing foreign key constraint if it exists
ALTER TABLE public.community_posts
DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

-- Add new foreign key constraint to profiles table
ALTER TABLE public.community_posts
ADD CONSTRAINT community_posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. Fix foreign key relationship for community_comments.user_id
ALTER TABLE public.community_comments
DROP CONSTRAINT IF EXISTS community_comments_user_id_fkey;

ALTER TABLE public.community_comments
ADD CONSTRAINT community_comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. Fix foreign key relationship for community_likes.user_id
ALTER TABLE public.community_likes
DROP CONSTRAINT IF EXISTS community_likes_user_id_fkey;

ALTER TABLE public.community_likes
ADD CONSTRAINT community_likes_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. Create or replace function to update post likes count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for likes count update
DROP TRIGGER IF EXISTS community_likes_trigger ON public.community_likes;
CREATE TRIGGER community_likes_trigger
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_likes_count();

-- 8. Create or replace function to update post comments count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET comments_count = comments_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle soft delete (is_deleted = true)
    IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
      UPDATE public.community_posts
      SET comments_count = comments_count - 1
      WHERE id = NEW.post_id;
    ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
      UPDATE public.community_posts
      SET comments_count = comments_count + 1
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create trigger for comments count update
DROP TRIGGER IF EXISTS community_comments_trigger ON public.community_comments;
CREATE TRIGGER community_comments_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.community_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_comments_count();

-- 10. Update RLS policies to handle both authenticated and public access properly
-- Drop existing policies
DROP POLICY IF EXISTS "Allow read access to community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Allow users to update their own posts" ON public.community_posts;

-- Create new policies that work with both authenticated and anonymous users
CREATE POLICY "Allow read access to community posts"
ON public.community_posts
FOR SELECT
USING (
  (status = 'published' AND is_deleted = false) OR
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

CREATE POLICY "Allow authenticated users to create posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. Fix comments RLS policies
DROP POLICY IF EXISTS "Allow read to all" ON public.community_comments;
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.community_comments;
DROP POLICY IF EXISTS "Allow update to owner" ON public.community_comments;
DROP POLICY IF EXISTS "Allow delete to owner" ON public.community_comments;

CREATE POLICY "Allow read comments"
ON public.community_comments
FOR SELECT
USING (is_deleted = false);

CREATE POLICY "Allow authenticated users to create comments"
ON public.community_comments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own comments"
ON public.community_comments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 12. Fix likes RLS policies
DROP POLICY IF EXISTS "Allow insert to authenticated" ON public.community_likes;
DROP POLICY IF EXISTS "Allow delete to owner" ON public.community_likes;
DROP POLICY IF EXISTS "Allow read to all" ON public.community_likes;

CREATE POLICY "Allow read likes"
ON public.community_likes
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage likes"
ON public.community_likes
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 13. Ensure apartments table has proper RLS
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow read apartments"
ON public.apartments
FOR SELECT
USING (true);

-- 14. Ensure cities table has proper RLS
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Allow read cities"
ON public.cities
FOR SELECT
USING (true);

-- 15. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);

-- 16. Refresh the schema cache
NOTIFY pgrst, 'reload schema';
