"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import * as tus from "tus-js-client";

export interface FileError {
  message: string;
  code: string;
}

export interface UploadFile {
  file: File;
  preview?: string;
  errors: Array<{ message: string }>;
  progress?: number;
  upload?: tus.Upload;
}

export interface UseSupabaseUploadOptions {
  bucketName: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  onUploadComplete?: (files: Array<{ name: string; url: string }>) => void;
  onUploadError?: (error: Error) => void;
}

export interface UseSupabaseUploadReturn {
  files: UploadFile[];
  uploadedFiles: Array<{ name: string; url: string }>;
  loading: boolean;
  errors: string[];
  isDragActive: boolean;
  isDragReject: boolean;
  removeFile: (index: number) => void;
  removeUploadedFile: (index: number) => void;
  uploadFiles: () => Promise<void>;
  clearAll: () => void;
  cancelUpload: (file: UploadFile) => void;
  getRootProps: () => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
}

export function useSupabaseUpload({
  bucketName,
  path = "",
  allowedMimeTypes = ["image/*"],
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  onUploadComplete,
  onUploadError,
}: UseSupabaseUploadOptions): UseSupabaseUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; url: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const supabase = createClient();

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        errors: [],
        progress: 0,
      }));

      const rejectionErrors = fileRejections.flatMap((rejection) =>
        rejection.errors.map((error) => `${rejection.file.name}: ${error.message}`),
      );
      setErrors(rejectionErrors);

      setFiles((prevFiles) => [...prevFiles, ...newFiles].slice(0, maxFiles));
    },
    [maxFiles],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: allowedMimeTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {},
    ),
    maxSize: maxFileSize,
    maxFiles,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      const removedFile = newFiles.splice(index, 1)[0];
      if (removedFile.preview) {
        URL.revokeObjectURL(removedFile.preview);
      }
      return newFiles;
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    files.forEach((f) => f.upload?.abort());
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
    setUploadedFiles([]);
    setErrors([]);
  };

  const cancelUpload = (fileToCancel: UploadFile) => {
    fileToCancel.upload?.abort();
    setFiles((prev) => prev.filter((f) => f.file !== fileToCancel.file));
  };

  const uploadFiles = useCallback(async () => {
    if (files.length === 0) return;

    console.log(`🔄 Starting upload of ${files.length} files to bucket: ${bucketName}${path ? `/${path}` : ''}`);
    setLoading(true);
    setErrors([]);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      console.error("❌ Upload failed: No authentication session");
      setErrors(["Authentication required to upload files."]);
      setLoading(false);
      return;
    }

    console.log(`✅ Authentication session valid, token expires at: ${new Date(session.expires_at! * 1000).toISOString()}`);

    const uploadPromises = files.map(
      (fileWrapper) =>
        new Promise<{ name: string; url: string }>((resolve, reject) => {
          const file = fileWrapper.file;
          // Sanitize filename to match database constraint: only alphanumeric, underscore, hyphen
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
          const fileName = `${path ? `${path}/` : ""}${Date.now()}-${sanitizedName}`;

          console.log(`📁 Preparing upload for file: ${file.name} -> ${fileName}`);
          console.log(`📊 File details: ${file.type}, ${Math.round(file.size / 1024)}KB`);

          const tusEndpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`;
          console.log(`🔗 TUS endpoint: ${tusEndpoint}`);

          const upload = new tus.Upload(file, {
            endpoint: tusEndpoint,
            retryDelays: [0, 3000, 5000, 10000, 20000],
            headers: {
              authorization: `Bearer ${session.access_token}`,
              "x-upsert": "true",
            },
            uploadDataDuringCreation: true,
            removeFingerprintOnSuccess: true,
            metadata: {
              bucketName: bucketName,
              objectName: fileName,
              contentType: file.type,
            },
            onError: (error) => {
              console.error(`❌ TUS Upload failed for ${file.name}:`, error);
              console.error("📋 Upload metadata:", { bucketName, fileName, contentType: file.type });
              console.error("🔍 Error details:", { message: error.message, name: error.name, stack: error.stack });
              setErrors((prev) => [...prev, `Upload failed for ${file.name}: ${error.message}`]);
              reject(error);
            },
            onProgress: (bytesUploaded, bytesTotal) => {
              const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
              setFiles((currentFiles) =>
                currentFiles.map((f) =>
                  f.file === file ? { ...f, progress: Number(percentage) } : f,
                ),
              );
            },
            onSuccess: () => {
              const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`;
              console.log(`✅ TUS Upload successful for ${file.name}`);
              console.log(`🔗 Public URL: ${publicUrl}`);
              resolve({ name: file.name, url: publicUrl });
            },
          });

          fileWrapper.upload = upload;
          console.log(`🚀 Starting TUS upload for ${file.name}`);
          upload.start();
        }),
    );

    try {
      console.log(`⏳ Waiting for ${uploadPromises.length} uploads to complete...`);
      const results = await Promise.all(uploadPromises);
      console.log(`🎉 All uploads completed successfully:`, results);
      setUploadedFiles((prev) => [...prev, ...results]);
      setFiles([]); // Clear files that have been uploaded
      onUploadComplete?.(results);
    } catch (error) {
      console.error(`💥 Upload batch failed:`, error);
      onUploadError?.(error as Error);
    } finally {
      setLoading(false);
    }
  }, [files, supabase, bucketName, path, onUploadComplete, onUploadError]);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return {
    files,
    uploadedFiles,
    loading,
    errors,
    isDragActive,
    isDragReject,
    removeFile,
    removeUploadedFile,
    uploadFiles,
    clearAll,
    cancelUpload,
    getRootProps,
    getInputProps,
  };
}
