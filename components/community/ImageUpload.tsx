"use client";

import React from "react";
import { useSupabaseUpload } from "@/lib/hooks/useSupabaseUpload";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const {
    files,
    uploadedFiles,
    loading,
    errors,
    isDragActive,
    removeFile,
    removeUploadedFile,
    uploadFiles,
    clearAll,
    getRootProps,
    getInputProps,
  } = useSupabaseUpload({
    maxFiles,
    maxFileSize,
    allowedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  // Initialize with existing images
  const [existingImages, setExistingImages] =
    React.useState<string[]>(initialImages);

  // Update parent when images change
  React.useEffect(() => {
    const allImageUrls = [
      ...existingImages,
      ...uploadedFiles.map((file) => file.url),
    ];
    onImagesChange(allImageUrls);
  }, [existingImages, uploadedFiles, onImagesChange]);

  const handleUpload = async () => {
    await uploadFiles();
  };

  const handleRemoveExisting = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const totalImages =
    existingImages.length + uploadedFiles.length + files.length;
  const canUploadMore = totalImages < maxFiles;

  return (
    <div
      className={cn("space-y-4", className)}
      role="region"
      aria-label="이미지 업로드 영역"
    >
      {/* Drag and Drop Zone */}
      {canUploadMore && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          )}
        >
          <input {...getInputProps()} className="sr-only" />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm">
              <span className="font-medium text-primary cursor-pointer">
                파일을 선택하거나
              </span>
              <span className="text-gray-600"> 여기에 드래그하세요</span>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP, GIF (최대 {Math.round(maxFileSize / 1024 / 1024)}
              MB)
            </p>
            <p className="text-xs text-gray-500">최대 {maxFiles}개 파일</p>
          </div>
        </div>
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">업로드 대기 중인 파일</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="파일 제거"
                >
                  <X className="h-3 w-3" />
                </button>
                <p
                  className="text-xs text-gray-600 mt-1 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                업로드 중...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {files.length}개 파일 업로드
              </>
            )}
          </Button>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">기존 이미지</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="이미지 제거"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">업로드된 이미지</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50 relative">
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeUploadedFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="이미지 제거"
                >
                  <X className="h-3 w-3" />
                </button>
                <p
                  className="text-xs text-gray-600 mt-1 truncate"
                  title={file.name}
                >
                  {file.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Clear All Button */}
      {(files.length > 0 ||
        uploadedFiles.length > 0 ||
        existingImages.length > 0) && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            clearAll();
            setExistingImages([]);
          }}
          className="w-full"
        >
          모든 이미지 제거
        </Button>
      )}

      {/* File Count Info */}
      <div className="text-xs text-gray-500 text-center">
        {totalImages}/{maxFiles} 이미지
      </div>

      {/* Upload status */}
      <div aria-live="polite">
        {loading && <span>이미지 업로드 중...</span>}
        {errors.length > 0 && (
          <ul className="text-red-500 text-xs mt-2">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
