CREATE INDEX idx_community_posts_apartment_category_created_at
ON public.community_posts (apartment_id, category, created_at DESC);
