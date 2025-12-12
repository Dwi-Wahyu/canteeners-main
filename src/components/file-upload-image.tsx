"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export function FileUploadImage({
  onFilesChange,
  multiple = true,
  initialPreviewUrl,
}: {
  onFilesChange?: (files: File[]) => void;
  multiple?: boolean;
  initialPreviewUrl?: string | null;
}) {
  const [files, setFiles] = React.useState<File[]>([]);

  const [showInitialPreview, setShowInitialPreview] = React.useState<boolean>(
    !!initialPreviewUrl
  );

  React.useEffect(() => {
    setShowInitialPreview(!!initialPreviewUrl && files.length === 0);
  }, [initialPreviewUrl, files.length]);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  const handleFileUploadChange = React.useCallback(
    (newFiles: File[]) => {
      setFiles(newFiles);
      if (newFiles.length > 0) {
        setShowInitialPreview(false);
      } else {
        setShowInitialPreview(!!initialPreviewUrl);
      }
      onFilesChange?.(newFiles);
    },
    [onFilesChange, initialPreviewUrl]
  );

  const handleDelete = () => {
    setFiles([]);
    setShowInitialPreview(false);
    // setShowInitialPreview(!!initialPreviewUrl);
    onFilesChange?.([]);
  };

  const previewUrl =
    files.length > 0
      ? URL.createObjectURL(files[0])
      : showInitialPreview && initialPreviewUrl
      ? initialPreviewUrl
      : null;

  const hasPreview = previewUrl !== null;

  return (
    <div>
      <FileUpload
        maxFiles={multiple ? 2 : 1}
        maxSize={5 * 1024 * 1024}
        className="w-full"
        value={files}
        onValueChange={handleFileUploadChange}
        onFileReject={onFileReject}
        multiple={multiple}
        accept="image/*"
      >
        <FileUploadDropzone className="relative min-h-48 border border-dashed rounded-md p-4 flex items-center justify-center text-center">
          {multiple ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center rounded-full border p-2.5">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">Drag & drop files here</p>
              <p className="text-muted-foreground text-xs">
                {multiple
                  ? "Or click to browse (max 2 files, up to 5MB each)"
                  : "Or click to browse (only 1 file, up to 5MB)"}
              </p>
            </div>
          ) : hasPreview ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <img
                src={previewUrl!}
                alt="Preview"
                className="max-h-28 object-contain rounded-md"
              />
              {files.length > 0 && (
                <FileUploadItem value={files[0]}>
                  <FileUploadItemMetadata />
                </FileUploadItem>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center rounded-full border p-2.5">
                <Upload className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">Drag & drop files here</p>
              <p className="text-muted-foreground text-xs">
                Or click to browse (only 1 file, up to 5MB)
              </p>
            </div>
          )}
          <FileUploadTrigger asChild></FileUploadTrigger>
        </FileUploadDropzone>

        {multiple && (
          <FileUploadList>
            {files.map((file, index) => (
              <FileUploadItem multiple={true} key={index} value={file}>
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </FileUploadItem>
            ))}
          </FileUploadList>
        )}
      </FileUpload>

      {!multiple && hasPreview && (
        <div className="mt-2 flex justify-center">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" /> Hapus Gambar
          </Button>
        </div>
      )}
    </div>
  );
}
