"use client";

import React from "react";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { Dropzone, DropzoneEmptyState, DropzoneContent } from "@/components/ui/dropzone";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onImagesChange: (urls: string[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  initialImages?: string[];
  className?: string;
}

export function ImageUpload({
  onImagesChange,
  maxFiles = 5,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  initialImages = [],
  className,
}: ImageUploadProps) {
  const uploadProps = useSupabaseUpload({
    bucketName: "community-images",
    path: "community-images", // Add path to match database constraint
    maxFiles,
    maxFileSize,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    onUploadComplete: (files) => {
      console.log("✅ Images uploaded successfully:", files);
    },
    onUploadError: (error) => {
      console.error("❌ Image upload failed:", error);
    },
  });

  const {
    files,
    uploadedFiles,
    isDragActive,
    isDragReject,
    getRootProps,
    getInputProps,
    uploadFiles,
    loading,
  } = uploadProps;

  // Initialize with existing images
  const [existingImages, setExistingImages] = React.useState<string[]>(initialImages);

  // Auto-upload files when they are selected
  React.useEffect(() => {
    if (files.length > 0 && !loading) {
      console.log("🚀 Auto-uploading", files.length, "files to storage bucket");
      uploadFiles();
    }
  }, [files.length, loading, uploadFiles]);

  // Update parent when images change
  React.useEffect(() => {
    const allImageUrls = [
      ...existingImages,
      ...uploadedFiles.map((file) => file.url),
    ];
    onImagesChange(allImageUrls);
  }, [existingImages, uploadedFiles, onImagesChange]);

  const handleRemoveExisting = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages = existingImages.length + uploadedFiles.length + files.length;
  const canUploadMore = totalImages < maxFiles;

  return (
    <div
      className={cn("space-y-4", className)}
      role="region"
      aria-label="이미지 업로드 영역"
    >
      <Dropzone className="space-y-4" {...uploadProps}>
        {/* Show dropzone only if we can upload more files */}
        {canUploadMore && (
          <DropzoneEmptyState
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            isDragReject={isDragReject}
            maxFileSize={maxFileSize}
            maxFiles={maxFiles}
            allowedMimeTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
          />
        )}

        {/* Show existing images */}
        {existingImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">기존 이미지</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {existingImages.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50 relative">
                    <Image
                      src={url}
                      alt={`기존 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExisting(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="이미지 제거"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show dropzone content (files waiting to upload and uploaded files) */}
        <DropzoneContent {...uploadProps} />

        {/* File count info */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          {totalImages}/{maxFiles} 이미지
        </div>
      </Dropzone>
    </div>
  );
}
