import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface UseSupabaseUploadOptions {
  bucket?: string;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export function useSupabaseUpload(options: UseSupabaseUploadOptions = {}) {
  const {
    bucket = "community-images",
    maxFiles = 5,
    maxFileSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  } = options;

  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const supabase = createClient();

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!allowedTypes.includes(file.type)) {
        return `파일 형식이 지원되지 않습니다. 지원 형식: ${allowedTypes.join(", ")}`;
      }
      if (file.size > maxFileSize) {
        return `파일 크기가 너무 큽니다. 최대 크기: ${Math.round(maxFileSize / 1024 / 1024)}MB`;
      }
      return null;
    },
    [allowedTypes, maxFileSize],
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles: File[] = [];
      const newErrors: string[] = [];

      fileArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
        } else if (files.length + validFiles.length < maxFiles) {
          validFiles.push(file);
        } else {
          newErrors.push(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        }
      });

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }
    },
    [files.length, maxFiles, validateFile],
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const uploadFiles = useCallback(async (): Promise<UploadedFile[]> => {
    if (files.length === 0) return [];

    setLoading(true);
    setErrors([]);
    const uploaded: UploadedFile[] = [];
    const uploadErrors: string[] = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `community/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          uploadErrors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

        uploaded.push({
          name: file.name,
          url: data.publicUrl,
          size: file.size,
          type: file.type,
        });
      } catch {
        uploadErrors.push(`${file.name}: 업로드 중 오류가 발생했습니다.`);
      }
    }

    setUploadedFiles((prev) => [...prev, ...uploaded]);
    setFiles([]);
    setLoading(false);

    if (uploadErrors.length > 0) {
      setErrors(uploadErrors);
    }

    return uploaded;
  }, [files, bucket, supabase]);

  const clearAll = useCallback(() => {
    setFiles([]);
    setUploadedFiles([]);
    setErrors([]);
  }, []);

  const getRootProps = useCallback(
    () => ({
      onDragEnter: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
      },
      onDragLeave: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
          addFiles(droppedFiles);
        }
      },
    }),
    [addFiles],
  );

  const getInputProps = useCallback(
    () => ({
      type: "file" as const,
      multiple: maxFiles > 1,
      accept: allowedTypes.join(","),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          addFiles(e.target.files);
        }
      },
    }),
    [maxFiles, allowedTypes, addFiles],
  );

  return {
    files,
    uploadedFiles,
    loading,
    errors,
    isDragActive,
    addFiles,
    removeFile,
    removeUploadedFile,
    uploadFiles,
    clearAll,
    getRootProps,
    getInputProps,
  };
}
