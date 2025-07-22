-- 1. Enable RLS on the table
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- 2. Create policy for SELECT (read)
-- Authenticated users can see all non-deleted, published posts.
-- Users can also see their own posts regardless of status.
CREATE POLICY "Allow read access to community posts"
ON public.community_posts
FOR SELECT
TO authenticated
USING (
  (status = 'published' AND is_deleted = false) OR
  (auth.uid() = user_id)
);

-- 3. Create policy for INSERT (create)
-- Authenticated users can create posts for themselves.
CREATE POLICY "Allow authenticated users to create posts"
ON public.community_posts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Create policy for UPDATE
-- Users can update their own posts.
CREATE POLICY "Allow users to update their own posts"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Create policy for DELETE
-- For this policy, we will prevent outright deletion.
-- Updates to `is_deleted = true` are handled by the UPDATE policy.
-- If you want to allow hard deletes, you can add a DELETE policy.
-- For now, no DELETE policy is added to prevent accidental data loss.
