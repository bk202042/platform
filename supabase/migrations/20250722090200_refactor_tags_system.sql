-- 1. Create the new `tags` table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create the new `post_tags` join table
CREATE TABLE public.post_tags (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- 3. (Optional) Migrate existing tags from the array to the new tables
-- This is a complex task and may need a more sophisticated script.
-- The following is a conceptual example.
-- DO
-- $$
-- DECLARE
--     post_record RECORD;
--     tag_name TEXT;
--     tag_id_var UUID;
-- BEGIN
--     FOR post_record IN SELECT id, tags FROM public.community_posts WHERE tags IS NOT NULL AND array_length(tags, 1) > 0 LOOP
--         FOREACH tag_name IN ARRAY post_record.tags LOOP
--             -- Find or create the tag
--             INSERT INTO public.tags (name) VALUES (tag_name)
--             ON CONFLICT (name) DO NOTHING;
--
--             SELECT id INTO tag_id_var FROM public.tags WHERE name = tag_name;
--
--             -- Create the relationship
--             INSERT INTO public.post_tags (post_id, tag_id) VALUES (post_record.id, tag_id_var)
--             ON CONFLICT (post_id, tag_id) DO NOTHING;
--         END LOOP;
--     END LOOP;
-- END;
-- $$;

-- 4. Remove the old `tags` column from `community_posts`
ALTER TABLE public.community_posts
DROP COLUMN tags;
