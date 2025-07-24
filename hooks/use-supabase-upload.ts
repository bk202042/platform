"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";

export interface FileWithPreview extends File {
  preview?: string;
  errors: Array<{ message: string }>;
}

export interface UseSupabaseUploadOptions {
  bucketName: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  cacheControl?: number;
  upsert?: boolean;
  onUploadComplete?: (files: Array<{ name: string; url: string }>) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseSupabaseUploadReturn {
  files: FileWithPreview[];
  setFiles: (files: FileWithPreview[]) => void;
  loading: boolean;
  errors: Array<{ name: string; message: string }>;
  successes: string[];
  isSuccess: boolean;
  isDragActive: boolean;
  isDragReject: boolean;
  maxFiles: number;
  maxFileSize: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: () => Promise<void>;
  getRootProps: () => any;
  getInputProps: () => any;
}

export function useSupabaseUpload({
  bucketName,
  path = "",
  allowedMimeTypes = ["image/*"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  cacheControl = 3600,
  upsert = false,
  onUploadComplete,
  onUploadError,
}: UseSupabaseUploadOptions): UseSupabaseUploadReturn {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Array<{ name: string; message: string }>
  >([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const validateFile = useCallback(
    (file: File): string[] => {
      const fileErrors: string[] = [];

      // Check file size
      if (file.size > maxFileSize) {
        fileErrors.push(`File is larger than ${maxFileSize} bytes`);
      }

      // Check file type
      const isValidType = allowedMimeTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        fileErrors.push(`File type ${file.type} is not allowed`);
      }

      return fileErrors;
    },
    [maxFileSize, allowedMimeTypes]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setIsSuccess(false);
      setErrors([]);
      setSuccesses([]);

      const newFiles: FileWithPreview[] = acceptedFiles.map((file) => {
        const fileErrors = validateFile(file);
        const fileWithPreview = Object.assign(file, {
          preview: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          errors: fileErrors.map((msg) => ({ message: msg })),
        });
        return fileWithPreview;
      });

      // Add rejected files with errors
      const rejectedFilesWithErrors: FileWithPreview[] = rejectedFiles.map(
        ({ file, errors }) =>
          Object.assign(file, {
            preview: file.type.startsWith("image/")
              ? URL.createObjectURL(file)
              : undefined,
            errors: errors.map((e: any) => ({ message: e.message })),
          })
      );

      const allFiles = [...newFiles, ...rejectedFilesWithErrors];

      // Limit to maxFiles
      const limitedFiles = allFiles.slice(0, maxFiles);

      setFiles((prev) => {
        // Clean up old previews
        prev.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
        return limitedFiles;
      });
    },
    [maxFiles, validateFile]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: allowedMimeTypes.reduce(
        (acc, type) => {
          acc[type] = [];
          return acc;
        },
        {} as Record<string, string[]>
      ),
      maxSize: maxFileSize,
      maxFiles,
      multiple: maxFiles > 1,
    });

  const onUpload = useCallback(async () => {
    if (files.length === 0 || files.some((file) => file.errors.length > 0)) {
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccesses([]);

    const uploadPromises = files.map(async (file) => {
      try {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "bin";
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `${timestamp}_${randomId}.${fileExt}`;
        const filePath = path ? `${path}/${fileName}` : fileName;

        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            cacheControl: cacheControl.toString(),
            upsert,
          });

        if (error) {
          throw error;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucketName).getPublicUrl(data.path);

        return {
          name: file.name,
          url: publicUrl,
          path: data.path,
        };
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successNames = results.map((r) => r.name);

      setSuccesses(successNames);
      setIsSuccess(true);

      onUploadComplete?.(results);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setErrors([{ name: "upload", message: errorMessage }]);
      onUploadError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  }, [
    files,
    bucketName,
    path,
    cacheControl,
    upsert,
    supabase,
    onUploadComplete,
    onUploadError,
  ]);

  return {
    files,
    setFiles,
    loading,
    errors,
    successes,
    isSuccess,
    isDragActive,
    isDragReject,
    maxFiles,
    maxFileSize,
    inputRef,
    onUpload,
    getRootProps,
    getInputProps,
  };
}
