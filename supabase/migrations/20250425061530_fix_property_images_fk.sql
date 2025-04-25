-- Migration: Fix foreign key constraint on property_images table
-- Description: Updates the foreign key on property_images.property_id to correctly reference property_listings(id) instead of properties(id).

-- Step 1: Drop the existing incorrect foreign key constraint
-- NOTE: Replace 'property_images_property_id_fkey' if your constraint has a different name!
ALTER TABLE public.property_images
DROP CONSTRAINT IF EXISTS property_images_property_id_fkey;

-- Step 2: Add the correct foreign key constraint referencing property_listings
ALTER TABLE public.property_images
ADD CONSTRAINT property_images_property_id_fkey
FOREIGN KEY (property_id)
REFERENCES public.property_listings(id)
ON DELETE CASCADE; -- Keep ON DELETE CASCADE if that was the original intent
