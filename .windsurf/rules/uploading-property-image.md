**Overall Process:**

1. **Create the Property Listing:** First, the new property needs to be added to the `public.property_listings` table in your database.
2. **Upload Images:** Upload the actual image files for this new property to your Supabase Storage bucket ("platform").
3. **Link Images in Database:** Add records to the `public.property_images` table to link the uploaded images (using their storage paths) to the newly created property listing.

**Detailed Steps:**

1. **Create Property Listing (Database INSERT):**
   - You (or the application logic) need to perform an `INSERT` operation into the `public.property_listings` table.
   - This requires providing all necessary details like `title`, `price`, `property_type`, `bedrooms`, `bathrooms`, `square_footage`, `location`, `address`, etc. (as we identified earlier by looking at the table schema).
   - **Crucially, this step will give you the unique `id` (UUID) of the newly created property.** You'll need this `property_id` for the next steps.
   - _(I can help construct and execute this INSERT statement if you provide the property details and switch to ACT MODE)._
2. **Upload Images to Supabase Storage (User Action):**
   - **This step must be done by you.** You need to upload the image files (e.g., `.jpg`, `.png`) for the new property into your "platform" bucket in Supabase Storage.
   - You can do this using the Supabase Dashboard (the web interface) or programmatically using the Supabase client library (`supabase.storage.from('platform').upload(...)`) within your application if you have an upload feature.
   - **Important:** For each uploaded image, note down its **storage path** within the bucket (e.g., `property-images/new-listing/kitchen.jpg`, `property-images/new-listing/bedroom1.jpg`). This path should be relative to the bucket root.
3. **Link Images in Database (Database INSERTs):**

   - Once you have the `property_id` (from Step 1) and the `storage_path`(s) (from Step 2) for the images, you need to insert records into the `public.property_images` table.
   - For *each* image you want to link, you'll run an `INSERT` statement similar to this:

     ```sql
     INSERT INTO public.property_images
       (property_id, storage_path, url, display_order, is_primary, alt_text)
     VALUES
       (
         '<property_id_from_step_1>',
         '<storage_path_from_step_2>', -- e.g., 'property-images/new-listing/kitchen.jpg'
         '<full_public_url>', -- e.g., 'https://khtcoztdkxhhrudwhhjv.supabase.co/storage/v1/object/public/platform/property-images/new-listing/kitchen.jpg'
         <order_number>, -- e.g., 0, 1, 2...
         <true_or_false>, -- Optional: true if this is the main image
         '<optional_alt_text>' -- Optional: description for accessibility
       );

     ```

   - You'll need to construct the `full_public_url` based on your Supabase project details and the `storage_path`. The pattern is: `https://<your-project-ref>.supabase.co/storage/v1/object/public/<bucket-name>/<storage_path>`.
   - Set the `display_order` to control the sequence in which images appear.
   - _(I can help construct and execute these INSERT statements if you provide the property ID, storage paths, desired order, etc., and switch to ACT MODE)._

**In Summary:**

- Create the property record first to get its ID.
- Upload the images to storage and get their paths.
- Insert records into `property_images` linking the property ID and image paths/URLs.
