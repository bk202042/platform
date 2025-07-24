"use client";

import { useState, useCallback, useEffect } from "react";
import {
  PostImage,
  CreatePostImageData,
  ImageReorderData,
} from "@/lib/types/community";
import {
  uploadPostImages,
  savePostImages,
  getPostImages,
  deletePostImage,
  reorderPostImages,
  validateImageFile,
} from "@/lib/data/community";

interface UseImageUploadManagerOptions {
  postId?: string;
  initialImages?: PostImage[];
  maxFiles?: number;
  maxFileSize?: number;
  onImagesChange?: (images: PostImage[]) => void;
}

export function useImageUploadManager({
  postId,
  initialImages = [],
  maxFiles = 5,
  maxFileSize: _maxFileSize = 5 * 1024 * 1024,
  onImagesChange,
}: UseImageUploadManagerOptions) {
  const [images, setImages] = useState<PostImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Notify parent of image changes
  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  // Load images for existing post
  const loadImages = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      const loadedImages = await getPostImages(postId);
      setImages(loadedImages);
    } catch (error) {
      console.error("Failed to load images:", error);
      setErrors(["이미지를 불러오는데 실패했습니다."]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload new files
  const uploadFiles = useCallback(
    async (files: File[]): Promise<PostImage[]> => {
      if (files.length === 0) return [];

      try {
        setLoading(true);
        setErrors([]);

        // Validate all files first
        const validationResults = await Promise.all(
          files.map((file) => validateImageFile(file))
        );

        const validationErrors = validationResults
          .filter((result) => !result.isValid)
          .flatMap((result) => result.errors);

        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return [];
        }

        // Upload files to storage
        const uploadResults = await uploadPostImages(files, postId);

        // If we have a postId, save to database immediately
        if (postId) {
          const imageData: CreatePostImageData[] = uploadResults.map(
            (result, index) => ({
              storage_path: result.storage_path,
              display_order: images.length + index,
              alt_text: result.metadata.original_name,
              metadata: result.metadata,
            })
          );

          const savedImages = await savePostImages(postId, imageData);
          setImages((prev) => [...prev, ...savedImages]);
          return savedImages;
        } else {
          // For new posts, create temporary PostImage objects
          const tempImages: PostImage[] = uploadResults.map(
            (result, index) => ({
              id: `temp-${Date.now()}-${index}`,
              post_id: postId || "",
              storage_path: result.storage_path,
              display_order: images.length + index,
              alt_text: result.metadata.original_name,
              metadata: result.metadata,
              created_at: new Date().toISOString(),
            })
          );

          setImages((prev) => [...prev, ...tempImages]);
          return tempImages;
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setErrors([
          error instanceof Error ? error.message : "업로드에 실패했습니다.",
        ]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [images.length, postId]
  );

  // Delete image
  const deleteImage = useCallback(async (imageId: string) => {
    try {
      setLoading(true);

      // If it's a temporary image (new post), just remove from state
      if (imageId.startsWith("temp-")) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      } else {
        // Delete from database and storage
        await deletePostImage(imageId);
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      setErrors(["이미지 삭제에 실패했습니다."]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder images
  const reorderImages = useCallback(
    async (reorderedImages: PostImage[]) => {
      const previousImages = [...images];

      try {
        // Update local state immediately for better UX
        setImages(reorderedImages);

        // If we have a postId and real images, update database
        const realImages = reorderedImages.filter(
          (img) => !img.id.startsWith("temp-")
        );

        if (postId && realImages.length > 0) {
          const reorderData: ImageReorderData[] = realImages.map(
            (img, index) => ({
              id: img.id,
              display_order: index,
            })
          );

          await reorderPostImages(reorderData);
        }
      } catch (error) {
        console.error("Reorder failed:", error);
        // Revert to previous state on error
        setImages(previousImages);
        setErrors(["이미지 순서 변경에 실패했습니다."]);
      }
    },
    [images, postId]
  );

  // Save temporary images to database (for new posts)
  const saveTemporaryImages = useCallback(
    async (newPostId: string): Promise<PostImage[]> => {
      const tempImages = images.filter((img) => img.id.startsWith("temp-"));

      if (tempImages.length === 0) return images;

      try {
        const imageData: CreatePostImageData[] = tempImages.map((img) => ({
          storage_path: img.storage_path,
          display_order: img.display_order,
          alt_text: img.alt_text,
          metadata: img.metadata,
        }));

        const savedImages = await savePostImages(newPostId, imageData);

        // Replace temporary images with saved ones
        const nonTempImages = images.filter(
          (img) => !img.id.startsWith("temp-")
        );
        const allImages = [...nonTempImages, ...savedImages];

        setImages(allImages);
        return allImages;
      } catch (error) {
        console.error("Failed to save temporary images:", error);
        throw error;
      }
    },
    [images]
  );

  // Clear all images
  const clearImages = useCallback(() => {
    setImages([]);
    setErrors([]);
    setUploadProgress({});
  }, []);

  // Get public URLs for images
  const getImageUrls = useCallback(() => {
    return images.map((img) => ({
      id: img.id,
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community-images/${img.storage_path}`,
      alt: img.alt_text || "",
    }));
  }, [images]);

  return {
    images,
    loading,
    errors,
    uploadProgress,
    loadImages,
    uploadFiles,
    deleteImage,
    reorderImages,
    saveTemporaryImages,
    clearImages,
    getImageUrls,
    canUploadMore: images.length < maxFiles,
    remainingSlots: Math.max(0, maxFiles - images.length),
  };
}
