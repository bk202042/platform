"use client";

import React from "react";
import { Upload, X, FileImage, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DropzoneProps {
  className?: string;
  children?: React.ReactNode;
}

export function Dropzone({ 
  className, 
  children
}: DropzoneProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children}
    </div>
  );
}

interface DropzoneEmptyStateProps {
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  isDragActive: boolean;
  isDragReject: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  allowedMimeTypes?: string[];
}

export function DropzoneEmptyState({
  getRootProps,
  getInputProps,
  isDragActive,
  isDragReject,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  allowedMimeTypes = ["image/*"]
}: DropzoneEmptyStateProps) {
  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        isDragActive && !isDragReject
          ? "border-primary bg-primary/10"
          : isDragReject
          ? "border-red-500 bg-red-50"
          : "border-gray-300 hover:border-gray-400"
      )}
    >
      <input {...getInputProps()} className="sr-only" />
      <div className="flex flex-col items-center gap-4">
        {isDragReject ? (
          <AlertCircle className="h-12 w-12 text-red-500" />
        ) : (
          <Upload className="h-12 w-12 text-gray-400" />
        )}
        
        <div className="space-y-2">
          <div className="text-lg font-medium">
            {isDragActive
              ? isDragReject
                ? "지원하지 않는 파일 형식입니다"
                : "파일을 놓으세요"
              : "파일을 업로드하세요"
            }
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>
              <span className="font-medium text-primary cursor-pointer">
                파일을 선택하거나
              </span>
              <span> 여기에 드래그하세요</span>
            </p>
            <p>
              {allowedMimeTypes.join(", ").replace(/image\//g, "").toUpperCase()} 
              {" "}(최대 {Math.round(maxFileSize / 1024 / 1024)}MB)
            </p>
            <p>최대 {maxFiles}개 파일</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DropzoneContentProps {
  files: Array<{
    file: File;
    preview?: string;
    errors: Array<{ message: string }>;
    progress?: number;
  }>;
  uploadedFiles: Array<{ name: string; url: string }>;
  loading: boolean;
  errors: string[];
  removeFile: (index: number) => void;
  removeUploadedFile: (index: number) => void;
  uploadFiles: () => Promise<void>;
  clearAll: () => void;
  cancelUpload: (file: { file: File; preview?: string; errors: Array<{ message: string }>; progress?: number }) => void;
}

export function DropzoneContent({
  files,
  uploadedFiles,
  loading,
  errors,
  removeFile,
  removeUploadedFile,
  uploadFiles,
  clearAll,
  cancelUpload
}: DropzoneContentProps) {
  const hasFiles = files.length > 0 || uploadedFiles.length > 0;

  if (!hasFiles && errors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Files waiting to upload */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">업로드 대기 중</h4>
            <Button
              type="button"
              onClick={uploadFiles}
              disabled={loading || files.length === 0}
              size="sm"
            >
              {loading ? "업로드 중..." : `${files.length}개 업로드`}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map((fileWrapper, index) => (
              <FilePreview
                key={index}
                file={fileWrapper.file}
                preview={fileWrapper.preview}
                progress={fileWrapper.progress}
                onRemove={() => removeFile(index)}
                onCancel={() => cancelUpload(fileWrapper)}
                loading={loading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Successfully uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-green-700">
            업로드 완료 ({uploadedFiles.length}개)
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {uploadedFiles.map((file, index) => (
              <UploadedFilePreview
                key={index}
                name={file.name}
                url={file.url}
                onRemove={() => removeUploadedFile(index)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-red-700">오류</h4>
          <div className="space-y-1">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear all button */}
      {hasFiles && (
        <div className="pt-2 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            size="sm"
            className="w-full"
          >
            모두 제거
          </Button>
        </div>
      )}
    </div>
  );
}

interface FilePreviewProps {
  file: File;
  preview?: string;
  progress?: number;
  onRemove: () => void;
  onCancel: () => void;
  loading: boolean;
}

function FilePreview({ 
  file, 
  preview, 
  progress, 
  onRemove, 
  onCancel, 
  loading 
}: FilePreviewProps) {
  const isImage = file.type.startsWith("image/");
  const isUploading = loading && progress !== undefined && progress < 100;

  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50 relative">
        {isImage && preview ? (
          <Image
            src={preview}
            alt={file.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileImage className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Upload progress overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-full mx-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-white text-xs mt-1 text-center">
                {progress}%
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Remove button */}
      <button
        type="button"
        onClick={isUploading ? onCancel : onRemove}
        className={cn(
          "absolute -top-2 -right-2 rounded-full p-1 transition-opacity",
          "opacity-0 group-hover:opacity-100",
          isUploading 
            ? "bg-orange-500 text-white hover:bg-orange-600" 
            : "bg-red-500 text-white hover:bg-red-600"
        )}
        aria-label={isUploading ? "업로드 취소" : "파일 제거"}
      >
        <X className="h-3 w-3" />
      </button>
      
      {/* File name */}
      <p className="text-xs text-gray-600 mt-1 truncate" title={file.name}>
        {file.name}
      </p>
    </div>
  );
}

interface UploadedFilePreviewProps {
  name: string;
  url: string;
  onRemove: () => void;
}

function UploadedFilePreview({ name, url, onRemove }: UploadedFilePreviewProps) {
  const isImage = name.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <div className="relative group">
      <div className="aspect-square rounded-lg border overflow-hidden bg-gray-50 relative">
        {isImage ? (
          <Image
            src={url}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileImage className="h-8 w-8 text-gray-400" />
          </div>
        )}
        
        {/* Success indicator */}
        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
          <span className="text-xs">✓</span>
        </div>
      </div>
      
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        aria-label="파일 제거"
      >
        <X className="h-3 w-3" />
      </button>
      
      {/* File name */}
      <p className="text-xs text-gray-600 mt-1 truncate" title={name}>
        {name}
      </p>
    </div>
  );
}