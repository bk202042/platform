-- Enhanced Community Schema with Vietnamese Location System
-- Migration for advanced community features
-- Created: 2025-07-24

-- 1. Create community_post_images table with proper indexes and RLS policies
CREATE TABLE community_post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_display_order CHECK (display_order >= 0),
  CONSTRAINT valid_storage_path CHECK (length(storage_path) > 0)
);

-- Indexes for community_post_images performance
CREATE INDEX idx_post_images_post_id ON community_post_images(post_id);
CREATE INDEX idx_post_images_order ON community_post_images(post_id, display_order);

-- RLS policies for community_post_images
ALTER TABLE community_post_images ENABLE ROW LEVEL SECURITY;

-- Allow read to all users
CREATE POLICY "Allow read to all" ON community_post_images
  FOR SELECT TO public USING (true);

-- Allow insert to authenticated users (via post ownership)
CREATE POLICY "Allow insert to post owner" ON community_post_images
  FOR INSERT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Allow update to post owner
CREATE POLICY "Allow update to post owner" ON community_post_images
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Allow delete to post owner
CREATE POLICY "Allow delete to post owner" ON community_post_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM community_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- 2. Add new columns to community_posts table
ALTER TABLE community_posts
ADD COLUMN status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN search_vector tsvector,
ADD COLUMN view_count INTEGER DEFAULT 0,
ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT now();

-- Enhanced indexes for community_posts
CREATE INDEX idx_posts_search_vector ON community_posts USING gin(search_vector);
CREATE INDEX idx_posts_last_activity ON community_posts(last_activity_at DESC);
CREATE INDEX idx_posts_status_created ON community_posts(status, created_at DESC);
CREATE INDEX idx_posts_apartment_category ON community_posts(apartment_id, category);

-- Partial indexes for better performance
CREATE INDEX idx_posts_published_recent ON community_posts(created_at DESC)
  WHERE is_deleted = false AND status = 'published';

CREATE INDEX idx_posts_popular_recent ON community_posts(likes_count DESC, created_at DESC)
  WHERE is_deleted = false AND status = 'published'
  AND created_at > (now() - interval '7 days');

-- 3. Enhance cities table for Vietnamese locations
-- Add Vietnamese-specific columns to cities table
ALTER TABLE cities
ADD COLUMN name_en TEXT,
ADD COLUMN name_ko TEXT,
ADD COLUMN country TEXT DEFAULT 'Vietnam',
ADD COLUMN timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
ADD COLUMN is_major_city BOOLEAN DEFAULT false;

-- Update existing cities with Vietnamese location data
UPDATE cities SET
  name_en = CASE
    WHEN name = 'Ho Chi Minh' THEN 'Ho Chi Minh City'
    WHEN name = 'Hanoi' THEN 'Hanoi'
    WHEN name = 'Da Nang' THEN 'Da Nang'
    ELSE name
  END,
  name_ko = CASE
    WHEN name = 'Ho Chi Minh' THEN '호치민시'
    WHEN name = 'Hanoi' THEN '하노이'
    WHEN name = 'Da Nang' THEN '다낭'
    ELSE name
  END,
  is_major_city = CASE
    WHEN name IN ('Ho Chi Minh', 'Hanoi', 'Da Nang') THEN true
    ELSE false
  END;

-- Ensure major Vietnamese cities exist
INSERT INTO cities (name, name_en, name_ko, country, timezone, is_major_city)
VALUES
  ('Ho Chi Minh', 'Ho Chi Minh City', '호치민시', 'Vietnam', 'Asia/Ho_Chi_Minh', true),
  ('Hanoi', 'Hanoi', '하노이', 'Vietnam', 'Asia/Ho_Chi_Minh', true),
  ('Da Nang', 'Da Nang', '다낭', 'Vietnam', 'Asia/Ho_Chi_Minh', true)
ON CONFLICT (name) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  country = EXCLUDED.country,
  timezone = EXCLUDED.timezone,
  is_major_city = EXCLUDED.is_major_city;

-- 4. Enhance apartments table for Vietnamese locations
ALTER TABLE apartments
ADD COLUMN name_en TEXT,
ADD COLUMN name_ko TEXT,
ADD COLUMN district TEXT,
ADD COLUMN district_en TEXT,
ADD COLUMN district_ko TEXT,
ADD COLUMN address TEXT,
ADD COLUMN address_en TEXT,
ADD COLUMN address_ko TEXT,
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Add indexes for location-based queries
CREATE INDEX idx_apartments_city_district ON apartments(city_id, district);
CREATE INDEX idx_apartments_location ON apartments(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_apartments_featured ON apartments(is_featured) WHERE is_featured = true;

-- 5. Create user_locations table for user preferences
CREATE TABLE user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES cities(id) NOT NULL,
  apartment_id UUID REFERENCES apartments(id),
  is_primary BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure only one primary location per user
  CONSTRAINT unique_primary_location UNIQUE (user_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Partial unique index for primary locations
CREATE UNIQUE INDEX idx_user_locations_primary ON user_locations(user_id)
  WHERE is_primary = true;

-- Regular indexes
CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_locations_city_id ON user_locations(city_id);
CREATE INDEX idx_user_locations_apartment_id ON user_locations(apartment_id);

-- RLS policies for user_locations
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own locations
CREATE POLICY "Users can view own locations" ON user_locations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own locations" ON user_locations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own locations" ON user_locations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own locations" ON user_locations
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Create search_suggestions table
CREATE TABLE search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('apartment', 'category', 'user', 'content', 'location')),
  metadata JSONB DEFAULT '{}',
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unique constraint on query and type
  UNIQUE (query, suggestion_type)
);

-- Indexes for search suggestions
CREATE INDEX idx_search_suggestions_query ON search_suggestions(query);
CREATE INDEX idx_search_suggestions_type ON search_suggestions(suggestion_type);
CREATE INDEX idx_search_suggestions_usage ON search_suggestions(usage_count DESC);
CREATE INDEX idx_search_suggestions_updated ON search_suggestions(updated_at DESC);

-- 7. Create user_activity table for tracking
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  activity_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_activity_type CHECK (activity_type IN ('view', 'like', 'comment', 'post', 'search', 'filter')),
  CONSTRAINT valid_resource_type CHECK (resource_type IN ('post', 'comment', 'user', 'apartment', 'search'))
);

-- Indexes for user activity
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX idx_user_activity_resource ON user_activity(resource_type, resource_id);
CREATE INDEX idx_user_activity_created ON user_activity(created_at DESC);

-- Partial index for recent activity
CREATE INDEX idx_user_activity_recent ON user_activity(user_id, created_at DESC)
  WHERE created_at > (now() - interval '30 days');

-- RLS policies for user_activity
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Users can only see their own activity
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- System can insert activity for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON user_activity
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 8. Create function to update search vector for posts
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER update_post_search_vector_trigger
  BEFORE INSERT OR UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

-- 9. Create function to update last_activity_at
CREATE OR REPLACE FUNCTION update_post_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity_at when comments or likes are added
  UPDATE community_posts
  SET last_activity_at = now()
  WHERE id = COALESCE(NEW.post_id, OLD.post_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity updates
CREATE TRIGGER update_post_activity_on_comment
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_activity();

CREATE TRIGGER update_post_activity_on_like
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_activity();

-- 10. Update existing search vectors for all posts
UPDATE community_posts SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(body, '')), 'B')
WHERE search_vector IS NULL;

-- 11. Create view for post with location information
CREATE VIEW community_posts_with_location AS
SELECT
  p.*,
  a.name as apartment_name,
  a.name_ko as apartment_name_ko,
  a.district,
  a.district_ko,
  c.name as city_name,
  c.name_ko as city_name_ko,
  c.country
FROM community_posts p
LEFT JOIN apartments a ON p.apartment_id = a.id
LEFT JOIN cities c ON a.city_id = c.id;

-- Grant necessary permissions
GRANT SELECT ON community_posts_with_location TO authenticated, anon;
