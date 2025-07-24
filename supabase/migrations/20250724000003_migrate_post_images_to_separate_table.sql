-- Data Migration: Move existing post images from array to separate table
-- Migration to transfer images from community_posts.images[] to community_post_images table
-- Created: 2025-07-24

-- Function to migrate existing images from array to separate table
CREATE OR REPLACE FUNCTION migrate_post_images()
RETURNS void AS $$
DECLARE
    post_record RECORD;
    image_path TEXT;
    image_order INTEGER;
BEGIN
    -- Loop through all posts that have images
    FOR post_record IN
        SELECT id, images
        FROM community_posts
        WHERE images IS NOT NULL
        AND array_length(images, 1) > 0
    LOOP
        -- Reset image order for each post
        image_order := 0;

        -- Loop through each image in the array
        FOR i IN 1..array_length(post_record.images, 1)
        LOOP
            image_path := post_record.images[i];

            -- Skip empty or null image paths
            IF image_path IS NOT NULL AND length(trim(image_path)) > 0 THEN
                -- Insert image into community_post_images table
                INSERT INTO community_post_images (
                    post_id,
                    storage_path,
                    display_order,
                    alt_text,
                    metadata
                ) VALUES (
                    post_record.id,
                    image_path,
                    image_order,
                    'Post image ' || (image_order + 1),
                    jsonb_build_object(
                        'migrated_from_array', true,
                        'original_array_index', i,
                        'migration_date', now()
                    )
                );

                image_order := image_order + 1;
            END IF;
        END LOOP;

        -- Log the migration for this post
        RAISE NOTICE 'Migrated % images for post %', image_order, post_record.id;
    END LOOP;

    RAISE NOTICE 'Image migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute the migration
SELECT migrate_post_images();

-- Verify the migration by checking counts
DO $$
DECLARE
    posts_with_images_count INTEGER;
    migrated_images_count INTEGER;
    total_array_images INTEGER;
BEGIN
    -- Count posts with images in array
    SELECT COUNT(*) INTO posts_with_images_count
    FROM community_posts
    WHERE images IS NOT NULL AND array_length(images, 1) > 0;

    -- Count migrated images
    SELECT COUNT(*) INTO migrated_images_count
    FROM community_post_images
    WHERE (metadata->>'migrated_from_array')::boolean = true;

    -- Count total images in arrays
    SELECT COALESCE(SUM(array_length(images, 1)), 0) INTO total_array_images
    FROM community_posts
    WHERE images IS NOT NULL AND array_length(images, 1) > 0;

    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- Posts with images: %', posts_with_images_count;
    RAISE NOTICE '- Total images in arrays: %', total_array_images;
    RAISE NOTICE '- Migrated images: %', migrated_images_count;

    -- Check if migration was successful
    IF migrated_images_count > 0 THEN
        RAISE NOTICE 'Migration appears successful!';
    ELSE
        RAISE NOTICE 'No images were migrated (this is normal if no posts had images)';
    END IF;
END $$;

-- Create a backup view of the original data before we remove the array column
CREATE VIEW community_posts_images_backup AS
SELECT
    id,
    images,
    created_at,
    'Original images array before migration to separate table' as backup_note
FROM community_posts
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- Grant access to the backup view
GRANT SELECT ON community_posts_images_backup TO authenticated, anon;

-- Clean up the migration function (optional - keep for debugging if needed)
-- DROP FUNCTION IF EXISTS migrate_post_images();

-- Add a comment to track this migration
COMMENT ON TABLE community_post_images IS 'Stores post images separately from posts. Migrated from community_posts.images array on 2025-07-24';

-- Note: We're not dropping the images column yet to allow for rollback if needed
-- The images column can be dropped in a future migration after verification
-- ALTER TABLE community_posts DROP COLUMN images;
