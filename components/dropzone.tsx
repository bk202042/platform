"use client";

import { cn } from "@/lib/utils";
import { type UseSupabaseUploadReturn } from "@/hooks/use-supabase-upload";
import { Button } from "@/components/ui/button";
import { CheckCircle, File, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from "react";

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: "bytes" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB" | "ZB" | "YB"
) => {
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  if (bytes === 0 || bytes === undefined)
    return size !== undefined ? `0 ${size}` : "0 bytes";
  const i =
    size !== undefined
      ? sizes.indexOf(size)
      : Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

type DropzoneContextType = UseSupabaseUploadReturn;

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined
);

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);
  if (!context) {
    throw new Error("useDropzoneContext must be used within Dropzone");
  }
  return context;
};

type DropzoneProps = UseSupabaseUploadReturn & {
  className?: string;
};

const Dropzone = ({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: PropsWithChildren<DropzoneProps>) => {
  const isSuccess = restProps.uploadedFiles.length > 0 && restProps.files.length === 0;
  const isActive = restProps.isDragActive;
  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0);

  return (
    <DropzoneContext.Provider value={{ getRootProps, getInputProps, ...restProps }}>
      <div
        {...getRootProps()}
        className={cn(
          "group relative grid w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isActive && "border-muted-foreground/50",
          isInvalid && "border-destructive/50 text-destructive",
          className
        )}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};

const DropzoneEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <div className="rounded-full border border-dashed p-3">
        <Upload className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-px">
        <p className="font-medium text-muted-foreground">
          Drag & drop files here, or click to select files
        </p>
        <p className="text-sm text-muted-foreground/70">
          You can upload multiple files (images, documents, etc.)
        </p>
      </div>
    </div>
  );
};

const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    removeFile,
    uploadFiles,
    loading,
    uploadedFiles,
  } = useDropzoneContext();

  const maxFiles = 5; // Default max files from the hook
  const exceedMaxFiles = files.length > maxFiles;

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      const fileIndex = files.findIndex((file) => file.file.name === fileName);
      if (fileIndex !== -1) {
        removeFile(fileIndex);
      }
    },
    [files, removeFile]
  );

  const isSuccess = uploadedFiles.length > 0 && files.length === 0;
  
  if (isSuccess) {
    return (
      <div
        className={cn(
          "flex flex-row items-center gap-x-2 justify-center",
          className
        )}
      >
        <CheckCircle size={16} className="text-primary" />
        <p className="text-primary text-sm">
          Successfully uploaded {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {files.map((file, idx) => {
        const fileError = file.errors && file.errors.length > 0 ? file.errors[0].message : null;
        const isSuccessfullyUploaded = uploadedFiles.some((uploaded) => uploaded.name === file.file.name);

        return (
          <div
            key={`${file.file.name}-${idx}`}
            className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4 "
          >
            {file.file.type.startsWith("image/") && file.preview ? (
              <div className="h-10 w-10 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center relative">
                <Image
                  src={file.preview}
                  alt={file.file.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center">
                <File size={18} />
              </div>
            )}

            <div className="shrink grow flex flex-col items-start truncate">
              <p title={file.file.name} className="text-sm truncate max-w-full">
                {file.file.name}
              </p>
              {file.errors.length > 0 ? (
                <p className="text-xs text-destructive">
                  {file.errors
                    .map((e) =>
                      e.message.startsWith("File is larger than")
                        ? `File is larger than ${formatBytes(5 * 1024 * 1024, 2)} (Size: ${formatBytes(file.file.size, 2)})`
                        : e.message
                    )
                    .join(", ")}
                </p>
              ) : loading && !isSuccessfullyUploaded ? (
                <p className="text-xs text-muted-foreground">
                  Uploading file...
                </p>
              ) : !!fileError ? (
                <p className="text-xs text-destructive">
                  Failed to upload: {fileError}
                </p>
              ) : isSuccessfullyUploaded ? (
                <p className="text-xs text-primary">
                  Successfully uploaded file
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.file.size, 2)}
                </p>
              )}
            </div>

            {!loading && !isSuccessfullyUploaded && (
              <Button
                size="icon"
                variant="link"
                className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveFile(file.file.name)}
              >
                <X />
              </Button>
            )}
          </div>
        );
      })}
      {exceedMaxFiles && (
        <p className="text-sm text-left mt-2 text-destructive">
          You may upload only up to {maxFiles} files, please remove{" "}
          {files.length - maxFiles} file
          {files.length - maxFiles > 1 ? "s" : ""}.
        </p>
      )}
      {files.length > 0 && !exceedMaxFiles && (
        <div className="mt-2">
          <Button
            variant="outline"
            onClick={uploadFiles}
            disabled={files.some((file) => file.errors.length !== 0) || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Upload files</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };