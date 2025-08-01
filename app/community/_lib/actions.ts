"use server";

import { validatedActionWithUser } from "@/lib/action-helpers";
import { createPostSchema } from "@/lib/validation/community";
import { createPost } from "@/lib/data/community";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { extractStoragePath } from "@/lib/utils/community-images";

export const createCommunityPost = validatedActionWithUser(
  createPostSchema,
  async (data, _, user) => {
    try {
      console.log(`INFO|server_action|createCommunityPost|user_id=${user.id}|apartment_id=${data.apartment_id}|category=${data.category}`);
      console.log(`INFO|server_action|createCommunityPost|images_count=${data.images?.length || 0}|user_id=${user.id}`);
      
      const post = await createPost({ ...data, user_id: user.id });
      
      // Save images to database if provided
      if (data.images && data.images.length > 0) {
        console.log(`INFO|server_action|createCommunityPost|saving_images|count=${data.images.length}|post_id=${post.id}`);
        
        const supabase = await createClient();
        const imageRecords = data.images.map((imageUrl, index) => {
          let storagePath: string;
          try {
            // Extract the actual storage path from the public URL
            storagePath = extractStoragePath(imageUrl);
            console.log(`INFO|server_action|createCommunityPost|extracted_path|${storagePath}|from_url|${imageUrl}`);
          } catch (error) {
            console.error(`ERROR|server_action|createCommunityPost|extract_path_failed|${error}|url=${imageUrl}`);
            // Fallback: try to extract manually if the utility fails
            storagePath = imageUrl.includes('/') ? imageUrl.split('/').slice(-2).join('/') : imageUrl;
          }
          
          return {
            post_id: post.id,
            storage_path: storagePath,
            display_order: index,
            alt_text: `Image ${index + 1}`,
            metadata: {},
          };
        });
        
        const { error: imageError } = await supabase
          .from("community_post_images")
          .insert(imageRecords);
          
        if (imageError) {
          console.error(`ERROR|server_action|createCommunityPost|image_save_failed|${imageError.message}|post_id=${post.id}`);
          // Don't fail the entire operation if images fail to save
        } else {
          console.log(`SUCCESS|server_action|createCommunityPost|images_saved|count=${data.images.length}|post_id=${post.id}`);
        }
      }
      
      revalidatePath("/community");
      
      console.log(`SUCCESS|server_action|createCommunityPost|post_id=${post.id}|user_id=${user.id}`);
      return { success: "Post created successfully.", data: post };
    } catch (error) {
      // Enhanced error logging with detailed categorization
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      
      console.error(`ERROR|server_action|createCommunityPost|${errorName}|${errorMessage}|user_id=${user.id}`);
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      // Categorize common error patterns for better user feedback
      let userMessage = "Failed to create post.";
      
      if (errorMessage.includes('apartment_id')) {
        console.error(`ERROR|INVALID_APARTMENT|apartment_id=${data.apartment_id}|user_id=${user.id}`);
        userMessage = "Invalid apartment selection. Please choose a valid apartment.";
      } else if (errorMessage.includes('user_id') || errorMessage.includes('authentication')) {
        console.error(`ERROR|AUTH_FAILURE|user_id=${user.id}|session_validation_failed`);
        userMessage = "Authentication error. Please log in again.";
      } else if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        console.error(`ERROR|DUPLICATE_POST|user_id=${user.id}|title=${data.title?.substring(0, 50)}`);
        userMessage = "This post appears to be a duplicate. Please try again.";
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        console.error(`ERROR|NETWORK_FAILURE|user_id=${user.id}|timeout_or_connection_error`);
        userMessage = "Network error. Please check your connection and try again.";
      } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        console.error(`ERROR|PERMISSION_DENIED|user_id=${user.id}|rls_or_permission_failure`);
        userMessage = "Permission denied. Please check your account permissions.";
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        console.error(`ERROR|VALIDATION_FAILURE|user_id=${user.id}|data_validation_failed`);
        userMessage = "Invalid data provided. Please check all fields and try again.";
      } else {
        console.error(`ERROR|UNKNOWN_SERVER_ACTION|user_id=${user.id}|unhandled_error_type`);
        userMessage = `Error: ${errorMessage.substring(0, 100)}. Please try again or contact support.`;
      }
      
      return { 
        error: userMessage,
        errorCode: errorName,
        timestamp: new Date().toISOString()
      };
    }
  },
);
