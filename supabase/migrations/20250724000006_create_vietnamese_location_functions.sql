-- Vietnamese Location Database Schema and Functions
-- Migration for Vietnamese location system with user preferences
-- Created: 2025-07-24

-- 1. Create location search functions for Vietnamese cities and apartments

-- Function to search Vietnamese locations with fuzzy matching
CREATE OR REPLACE FUNCTION search_vietnamese_locations(
  search_query TEXT,
  search_type TEXT DEFAULT 'all', -- 'city', 'apartment', 'all'
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  name_ko TEXT,
  name_en TEXT,
  full_address TEXT,
  full_address_ko TEXT,
  city_name TEXT,
  city_name_ko TEXT,
  district TEXT,
  district_ko TEXT,
  similarity_score REAL
) AS $$
BEGIN
  -- Search cities if requested
  IF search_type IN ('city', 'all') THEN
    RETURN QUERY
    SELECT
      c.id,
      'city'::TEXT as type,
      c.name,
      c.name_ko,
      c.name_en,
      c.name as full_address,
      c.name_ko as full_address_ko,
      c.name as city_name,
      c.name_ko as city_name_ko,
      NULL::TEXT as district,
      NULL::TEXT as district_ko,
      GREATEST(
        similarity(c.name, search_query),
        similarity(COALESCE(c.name_ko, ''), search_query),
        similarity(COALESCE(c.name_en, ''), search_query)
      ) as similarity_score
    FROM cities c
    WHERE c.country = 'Vietnam'
      AND (
        c.name ILIKE '%' || search_query || '%'
        OR COALESCE(c.name_ko, '') ILIKE '%' || search_query || '%'
        OR COALESCE(c.name_en, '') ILIKE '%' || search_query || '%'
        OR similarity(c.name, search_query) > 0.3
        OR similarity(COALESCE(c.name_ko, ''), search_query) > 0.3
        OR similarity(COALESCE(c.name_en, ''), search_query) > 0.3
      )
    ORDER BY similarity_score DESC
    LIMIT limit_count;
  END IF;

  -- Search apartments if requested
  IF search_type IN ('apartment', 'all') THEN
    RETURN QUERY
    SELECT
      a.id,
      'apartment'::TEXT as type,
      a.name,
      a.name_ko,
      a.name_en,
      CASE
        WHEN a.district IS NOT NULL THEN
          COALESCE(c.name, '') || ', ' || COALESCE(a.district, '') || ', ' || COALESCE(a.name, '')
        ELSE
          COALESCE(c.name, '') || ', ' || COALESCE(a.name, '')
      END as full_address,
      CASE
        WHEN a.district_ko IS NOT NULL THEN
          COALESCE(c.name_ko, '') || ', ' || COALESCE(a.district_ko, '') || ', ' || COALESCE(a.name_ko, '')
        ELSE
          COALESCE(c.name_ko, '') || ', ' || COALESCE(a.name_ko, '')
      END as full_address_ko,
      c.name as city_name,
      c.name_ko as city_name_ko,
      a.district,
      a.district_ko,
      GREATEST(
        similarity(a.name, search_query),
        similarity(COALESCE(a.name_ko, ''), search_query),
        similarity(COALESCE(a.name_en, ''), search_query),
        similarity(COALESCE(a.district, ''), search_query),
        similarity(COALESCE(a.district_ko, ''), search_query),
        similarity(COALESCE(c.name, ''), search_query),
        similarity(COALESCE(c.name_ko, ''), search_query)
      ) as similarity_score
    FROM apartments a
    LEFT JOIN cities c ON a.city_id = c.id
    WHERE c.country = 'Vietnam'
      AND (
        a.name ILIKE '%' || search_query || '%'
        OR COALESCE(a.name_ko, '') ILIKE '%' || search_query || '%'
        OR COALESCE(a.name_en, '') ILIKE '%' || search_query || '%'
        OR COALESCE(a.district, '') ILIKE '%' || search_query || '%'
        OR COALESCE(a.district_ko, '') ILIKE '%' || search_query || '%'
        OR COALESCE(c.name, '') ILIKE '%' || search_query || '%'
        OR COALESCE(c.name_ko, '') ILIKE '%' || search_query || '%'
        OR similarity(a.name, search_query) > 0.3
        OR similarity(COALESCE(a.name_ko, ''), search_query) > 0.3
        OR similarity(COALESCE(a.district, ''), search_query) > 0.3
        OR similarity(COALESCE(c.name, ''), search_query) > 0.3
      )
    ORDER BY similarity_score DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's preferred locations
CREATE OR REPLACE FUNCTION get_user_preferred_locations(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  city_id UUID,
  apartment_id UUID,
  is_primary BOOLEAN,
  city_name TEXT,
  city_name_ko TEXT,
  apartment_name TEXT,
  apartment_name_ko TEXT,
  district TEXT,
  district_ko TEXT,
  full_address TEXT,
  full_address_ko TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.id,
    ul.city_id,
    ul.apartment_id,
    ul.is_primary,
    c.name as city_name,
    c.name_ko as city_name_ko,
    a.name as apartment_name,
    a.name_ko as apartment_name_ko,
    a.district,
    a.district_ko,
    CASE
      WHEN a.district IS NOT NULL THEN
        COALESCE(c.name, '') || ', ' || COALESCE(a.district, '') || ', ' || COALESCE(a.name, '')
      ELSE
        COALESCE(c.name, '') || ', ' || COALESCE(a.name, '')
    END as full_address,
    CASE
      WHEN a.district_ko IS NOT NULL THEN
        COALESCE(c.name_ko, '') || ', ' || COALESCE(a.district_ko, '') || ', ' || COALESCE(a.name_ko, '')
      ELSE
        COALESCE(c.name_ko, '') || ', ' || COALESCE(a.name_ko, '')
    END as full_address_ko
  FROM user_locations ul
  LEFT JOIN cities c ON ul.city_id = c.id
  LEFT JOIN apartments a ON ul.apartment_id = a.id
  WHERE ul.user_id = user_uuid
  ORDER BY ul.is_primary DESC, ul.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get apartments by city with Vietnamese formatting
CREATE OR REPLACE FUNCTION get_apartments_by_city(city_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  name_ko TEXT,
  name_en TEXT,
  district TEXT,
  district_ko TEXT,
  address TEXT,
  address_ko TEXT,
  full_address TEXT,
  full_address_ko TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  is_featured BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.name_ko,
    a.name_en,
    a.district,
    a.district_ko,
    a.address,
    a.address_ko,
    CASE
      WHEN a.district IS NOT NULL THEN
        COALESCE(c.name, '') || ', ' || COALESCE(a.district, '') || ', ' || COALESCE(a.name, '')
      ELSE
        COALESCE(c.name, '') || ', ' || COALESCE(a.name, '')
    END as full_address,
    CASE
      WHEN a.district_ko IS NOT NULL THEN
        COALESCE(c.name_ko, '') || ', ' || COALESCE(a.district_ko, '') || ', ' || COALESCE(a.name_ko, '')
      ELSE
        COALESCE(c.name_ko, '') || ', ' || COALESCE(a.name_ko, '')
    END as full_address_ko,
    a.latitude,
    a.longitude,
    a.is_featured
  FROM apartments a
  LEFT JOIN cities c ON a.city_id = c.id
  WHERE a.city_id = city_uuid
  ORDER BY a.is_featured DESC, a.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to update user location preferences
CREATE OR REPLACE FUNCTION set_user_primary_location(
  user_uuid UUID,
  city_uuid UUID,
  apartment_uuid UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  location_id UUID;
BEGIN
  -- First, unset any existing primary location
  UPDATE user_locations
  SET is_primary = false
  WHERE user_id = user_uuid AND is_primary = true;

  -- Check if this location already exists for the user
  SELECT id INTO location_id
  FROM user_locations
  WHERE user_id = user_uuid
    AND city_id = city_uuid
    AND (apartment_id = apartment_uuid OR (apartment_id IS NULL AND apartment_uuid IS NULL));

  IF location_id IS NOT NULL THEN
    -- Update existing location to be primary
    UPDATE user_locations
    SET is_primary = true, updated_at = now()
    WHERE id = location_id;
  ELSE
    -- Insert new primary location
    INSERT INTO user_locations (user_id, city_id, apartment_id, is_primary)
    VALUES (user_uuid, city_uuid, apartment_uuid, true)
    RETURNING id INTO location_id;
  END IF;

  RETURN location_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add user location preference
CREATE OR REPLACE FUNCTION add_user_location_preference(
  user_uuid UUID,
  city_uuid UUID,
  apartment_uuid UUID DEFAULT NULL,
  make_primary BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
  location_id UUID;
BEGIN
  -- Check if this location already exists for the user
  SELECT id INTO location_id
  FROM user_locations
  WHERE user_id = user_uuid
    AND city_id = city_uuid
    AND (apartment_id = apartment_uuid OR (apartment_id IS NULL AND apartment_uuid IS NULL));

  IF location_id IS NOT NULL THEN
    -- Update existing location
    UPDATE user_locations
    SET is_primary = make_primary,
        notification_enabled = true,
        updated_at = now()
    WHERE id = location_id;

    -- If making this primary, unset other primary locations
    IF make_primary THEN
      UPDATE user_locations
      SET is_primary = false
      WHERE user_id = user_uuid AND id != location_id;
    END IF;
  ELSE
    -- If making this primary, unset other primary locations first
    IF make_primary THEN
      UPDATE user_locations
      SET is_primary = false
      WHERE user_id = user_uuid;
    END IF;

    -- Insert new location
    INSERT INTO user_locations (user_id, city_id, apartment_id, is_primary, notification_enabled)
    VALUES (user_uuid, city_uuid, apartment_uuid, make_primary, true)
    RETURNING id INTO location_id;
  END IF;

  RETURN location_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get location-based posts with RLS
CREATE OR REPLACE FUNCTION get_posts_by_user_locations(
  user_uuid UUID,
  category_filter TEXT DEFAULT NULL,
  sort_option TEXT DEFAULT 'latest', -- 'latest', 'popular'
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  title TEXT,
  body TEXT,
  category TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMPTZ,
  user_id UUID,
  apartment_id UUID,
  apartment_name TEXT,
  apartment_name_ko TEXT,
  city_name TEXT,
  city_name_ko TEXT,
  district TEXT,
  district_ko TEXT,
  is_user_location BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as post_id,
    p.title,
    p.body,
    p.category::TEXT,
    p.likes_count,
    p.comments_count,
    p.created_at,
    p.user_id,
    p.apartment_id,
    a.name as apartment_name,
    a.name_ko as apartment_name_ko,
    c.name as city_name,
    c.name_ko as city_name_ko,
    a.district,
    a.district_ko,
    CASE WHEN ul.id IS NOT NULL THEN true ELSE false END as is_user_location
  FROM community_posts p
  LEFT JOIN apartments a ON p.apartment_id = a.id
  LEFT JOIN cities c ON a.city_id = c.id
  LEFT JOIN user_locations ul ON (
    ul.user_id = user_uuid
    AND (ul.city_id = c.id OR ul.apartment_id = a.id)
  )
  WHERE p.is_deleted = false
    AND p.status = 'published'
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (
      -- Show posts from user's preferred locations
      ul.id IS NOT NULL
      OR
      -- Show posts from major Vietnamese cities if user has no preferences
      (NOT EXISTS (SELECT 1 FROM user_locations WHERE user_id = user_uuid)
       AND c.is_major_city = true)
    )
  ORDER BY
    CASE WHEN sort_option = 'popular' THEN p.likes_count END DESC,
    CASE WHEN sort_option = 'latest' THEN p.created_at END DESC,
    ul.is_primary DESC NULLS LAST
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Enable pg_trgm extension for fuzzy search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_vietnamese_locations(TEXT, TEXT, INTEGER) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_preferred_locations(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_apartments_by_city(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION set_user_primary_location(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_location_preference(UUID, UUID, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_posts_by_user_locations(UUID, TEXT, TEXT, INTEGER, INTEGER) TO authenticated;

-- Create indexes for better performance on location searches
CREATE INDEX IF NOT EXISTS idx_apartments_name_trgm ON apartments USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_apartments_name_ko_trgm ON apartments USING gin (name_ko gin_trgm_ops) WHERE name_ko IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_apartments_district_trgm ON apartments USING gin (district gin_trgm_ops) WHERE district IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON cities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cities_name_ko_trgm ON cities USING gin (name_ko gin_trgm_ops) WHERE name_ko IS NOT NULL;

-- Add location-based RLS policies for community posts
CREATE POLICY "Allow location-based post access" ON community_posts
  FOR SELECT TO authenticated
  USING (
    -- Users can see posts from their preferred locations
    EXISTS (
      SELECT 1 FROM user_locations ul
      LEFT JOIN apartments a ON ul.apartment_id = a.id
      WHERE ul.user_id = auth.uid()
        AND (ul.city_id = (SELECT city_id FROM apartments WHERE id = apartment_id)
             OR ul.apartment_id = apartment_id)
    )
    OR
    -- Users can see posts from major cities if they have no location preferences
    (NOT EXISTS (SELECT 1 FROM user_locations WHERE user_id = auth.uid())
     AND EXISTS (
       SELECT 1 FROM apartments a
       LEFT JOIN cities c ON a.city_id = c.id
       WHERE a.id = apartment_id AND c.is_major_city = true
     ))
    OR
    -- Users can always see their own posts
    user_id = auth.uid()
  );

</content>
</invoke>
