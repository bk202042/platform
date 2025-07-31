"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";

import { X, GripVertical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  PostImage,
  CreatePostImageData,
  ImageReorderData,
  CommunityImageDropzoneConfig,
} from "@/lib/types/community";
import {
  savePostImages,
  deletePostImage,
  reorderPostImages,
} from "@/lib/data/community";

interface ImageUploadManagerProps {
  onImagesChange: (images: PostImage[]) => void;
  initialImages?: PostImage[];
  postId?: string;
  maxFiles?: number;
  maxFileSize?: number;
  className?: string;
  config?: Partial<CommunityImageDropzoneConfig>;
}

interface DraggedImage extends PostImage {
  isDragging?: boolean;
  dragIndex?: number;
}

export function ImageUploadManager({
  onImagesChange,
  initialImages = [],
  postId,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  className,
  config,
}: ImageUploadManagerProps) {
  const [savedImages, setSavedImages] = useState<PostImage[]>(initialImages);
  const [draggedImages, setDraggedImages] =
    useState<DraggedImage[]>(initialImages);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Dropzone configuration
  const dropzoneConfig: CommunityImageDropzoneConfig = {
    maxFiles,
    maxFileSize,
    acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    bucket: "community-images",
    folder: "community-images",
    ...config,
  };

  // Handle successful uploads from Dropzone
  const handleUploadComplete = useCallback(
    async (
      uploadedFiles: Array<{ name: string; url: string; path?: string }>
    ) => {
      if (!postId) return;

      try {
        // Convert uploaded files to CreatePostImageData
        const imageData: CreatePostImageData[] = uploadedFiles.map(
          (file, index) => ({
            storage_path: file.path || file.url.split("/").pop() || file.name,
            display_order: savedImages.length + index,
            alt_text: file.name,
            metadata: {
              original_name: file.name,
            },
          })
        );

        // Save to database
        const newImages = await savePostImages(postId, imageData);
        setSavedImages((prev) => [...prev, ...newImages]);
        setDraggedImages((prev) => [...prev, ...newImages]);
      } catch (error) {
        console.error("Failed to save uploaded images:", error);
      }
    },
    [postId, savedImages.length]
  );

  const handleUploadError = useCallback((error: Error) => {
    console.error("Upload error:", error);
  }, []);

  const supabaseUpload = useSupabaseUpload({
    bucketName: dropzoneConfig.bucket,
    path: dropzoneConfig.folder, // This already matches the bucket name for path
    allowedMimeTypes: dropzoneConfig.acceptedTypes,
    maxFileSize: dropzoneConfig.maxFileSize,
    maxFiles: dropzoneConfig.maxFiles - savedImages.length, // Adjust for existing images
    onUploadComplete: handleUploadComplete,
    onUploadError: handleUploadError,
  });

  // Update parent when images change
  useEffect(() => {
    onImagesChange(savedImages);
  }, [savedImages, onImagesChange]);

  const handleDeleteImage = async (imageId: string) => {
    setDeleteLoading(imageId);
    try {
      await deletePostImage(imageId);
      setSavedImages((prev) => prev.filter((img) => img.id !== imageId));
      setDraggedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
    setDraggedImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isDragging: i === index,
        dragIndex: i === index ? index : undefined,
      }))
    );
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain") || "-1");
    if (dragIndex === -1 || dragIndex === index) return;

    setDraggedImages((prev) => {
      const newImages = [...prev];
      const draggedItem = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(index, 0, draggedItem);
      return newImages.map((img, i) => ({ ...img, display_order: i }));
    });
  };

  const handleDragEnd = async () => {
    setReorderLoading(true);
    try {
      // Check if order actually changed
      const hasOrderChanged = draggedImages.some(
        (img, index) => img.display_order !== index
      );

      if (hasOrderChanged) {
        const reorderData: ImageReorderData[] = draggedImages.map(
          (img, index) => ({
            id: img.id,
            display_order: index,
          })
        );

        await reorderPostImages(reorderData);
        setSavedImages(
          draggedImages.map((img) => ({
            ...img,
            display_order: img.display_order,
          }))
        );
      }

      // Clear drag state
      setDraggedImages((prev) =>
        prev.map((img) => ({
          ...img,
          isDragging: false,
          dragIndex: undefined,
        }))
      );
    } catch (error) {
      console.error("Failed to reorder images:", error);
      // Revert to original order
      setDraggedImages(savedImages);
    } finally {
      setReorderLoading(false);
    }
  };

  const getPublicUrl = (storagePath: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${dropzoneConfig.bucket}/${storagePath}`;
  };

  const canUploadMore =
    savedImages.length + supabaseUpload.files.length < maxFiles;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone for new uploads */}
      {canUploadMore && (
        <Dropzone {...supabaseUpload} className="min-h-[120px]">
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      )}

      {/* Existing/Saved Images with Drag & Drop Reordering */}
      {draggedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              업로드된 이미지 ({draggedImages.length}/{maxFiles})
            </h4>
            {reorderLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                순서 변경 중...
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {draggedImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative group cursor-move transition-all duration-200",
                  image.isDragging && "opacity-50 scale-95",
                  reorderLoading && "pointer-events-none"
                )}
              >
                <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50 relative">
                  <Image
                    src={getPublicUrl(image.storage_path)}
                    alt={image.alt_text || `이미지 ${index + 1}`}
                    fill
                    className="object-cover"
                  />

                  {/* Drag handle */}
                  <div className="absolute top-2 left-2 bg-black/50 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-3 w-3 text-white" />
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deleteLoading === image.id}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    aria-label="이미지 삭제"
                  >
                    {deleteLoading === image.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </button>

                  {/* Display order indicator */}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>

                <p
                  className="text-xs text-gray-600 mt-1 truncate"
                  title={image.alt_text || image.storage_path}
                >
                  {image.alt_text || `이미지 ${index + 1}`}
                </p>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500 text-center">
            이미지를 드래그하여 순서를 변경할 수 있습니다
          </div>
        </div>
      )}

      {/* Upload status and errors */}
      {supabaseUpload.errors.length > 0 && (
        <div className="space-y-1">
          {supabaseUpload.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* File count info */}
      <div className="text-xs text-gray-500 text-center">
        {savedImages.length + supabaseUpload.files.length}/{maxFiles} 이미지
        {!canUploadMore && (
          <span className="text-amber-600 ml-2">
            (최대 개수에 도달했습니다)
          </span>
        )}
      </div>
    </div>
  );
}
