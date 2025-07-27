/**
 * Community Images Utilities
 * 
 * Utilities for processing images in community posts, including:
 * - Extracting storage paths from Supabase public URLs
 * - Converting image URLs to database records
 * - Validating image data
 */

import { CreatePostImageData, ImageUploadResult } from '@/lib/types/community';

/**
 * Extracts the storage path from a Supabase public URL
 * @param publicUrl - The full public URL from Supabase Storage
 * @returns The storage path (e.g., "community-images/uuid-filename.jpg")
 */
export function extractStoragePath(publicUrl: string): string {
  try {
    const url = new URL(publicUrl);
    
    // Supabase storage URLs have the format:
    // https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file
    const pathParts = url.pathname.split('/');
    
    // Find the bucket name and path after "/object/public/"
    const publicIndex = pathParts.findIndex(part => part === 'public');
    if (publicIndex === -1 || publicIndex + 2 >= pathParts.length) {
      throw new Error('Invalid Supabase storage URL format');
    }
    
    // Extract bucket and file path
    const bucketName = pathParts[publicIndex + 1];
    const filePath = pathParts.slice(publicIndex + 2).join('/');
    
    return `${bucketName}/${filePath}`;
  } catch (error) {
    console.error('Failed to extract storage path from URL:', publicUrl, error);
    throw new Error(`Invalid storage URL: ${publicUrl}`);
  }
}

/**
 * Validates that a storage path is for community images
 * @param storagePath - The storage path to validate
 * @returns True if the path is valid for community images
 */
export function isValidCommunityImagePath(storagePath: string): boolean {
  return storagePath.startsWith('community-images/') && 
         /\.(jpg|jpeg|png|webp|gif)$/i.test(storagePath);
}

/**
 * Converts an array of image URLs to CreatePostImageData objects
 * @param imageUrls - Array of public URLs from image upload
 * @returns Array of data objects ready for database insertion
 */
export function convertUrlsToImageData(imageUrls: string[]): CreatePostImageData[] {
  return imageUrls.map((url, index) => {
    const storagePath = extractStoragePath(url);
    
    if (!isValidCommunityImagePath(storagePath)) {
      throw new Error(`Invalid community image path: ${storagePath}`);
    }
    
    return {
      storage_path: storagePath,
      display_order: index,
      alt_text: null,
      metadata: {
        // We'll extract this from the file name or use defaults
        original_name: extractOriginalFileName(storagePath),
      },
    };
  });
}

/**
 * Extracts the original file name from a storage path
 * @param storagePath - The storage path
 * @returns The original file name or a default
 */
function extractOriginalFileName(storagePath: string): string {
  const fileName = storagePath.split('/').pop();
  if (!fileName) return 'image';
  
  // Remove UUID prefix if present (format: uuid-originalname.ext)
  const parts = fileName.split('-');
  if (parts.length > 1 && parts[0].length === 36) {
    return parts.slice(1).join('-');
  }
  
  return fileName;
}

/**
 * Validates image upload data
 * @param imageData - The image data to validate
 * @returns Validation result with any errors
 */
export function validateImageData(imageData: CreatePostImageData[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (imageData.length > 10) {
    errors.push('Maximum 10 images allowed per post');
  }
  
  imageData.forEach((image, index) => {
    if (!image.storage_path) {
      errors.push(`Image ${index + 1}: Storage path is required`);
    }
    
    if (!isValidCommunityImagePath(image.storage_path)) {
      errors.push(`Image ${index + 1}: Invalid storage path format`);
    }
    
    if (typeof image.display_order !== 'number' || image.display_order < 0) {
      errors.push(`Image ${index + 1}: Invalid display order`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Creates a public URL from a storage path
 * @param storagePath - The storage path
 * @param supabaseUrl - The Supabase project URL
 * @returns The public URL for the image
 */
export function createPublicUrl(storagePath: string, supabaseUrl: string): string {
  const cleanUrl = supabaseUrl.replace(/\/$/, '');
  return `${cleanUrl}/storage/v1/object/public/${storagePath}`;
}

/**
 * Processes uploaded images for database insertion
 * @param imageUrls - Array of uploaded image URLs
 * @returns Validated array of image data ready for database insertion
 */
export function processUploadedImages(imageUrls: string[]): CreatePostImageData[] {
  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }
  
  const imageData = convertUrlsToImageData(imageUrls);
  const validation = validateImageData(imageData);
  
  if (!validation.isValid) {
    throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
  }
  
  return imageData;
}