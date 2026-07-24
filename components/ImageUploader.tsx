"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — matches backend's limit

export default function ImageUploader({
  onFileSelected,
  disabled = false,
}: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback(
    (file: File | undefined | null) => {
      setError(null);

      if (!file) {
        onFileSelected(null);
        setPreviewUrl(null);
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError(
          "Unsupported file type. Please upload a JPG, PNG, or WEBP image.",
        );
        onFileSelected(null);
        setPreviewUrl(null);
        return;
      }

      if (file.size > MAX_SIZE_BYTES) {
        setError("File too large. Max allowed size is 10 MB.");
        onFileSelected(null);
        setPreviewUrl(null);
        return;
      }

      // Revoke the previous object URL to avoid a memory leak before creating a new one
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleClear = () => {
    validateAndSetFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Upload Fish Image
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed
          p-6 text-center transition-colors cursor-pointer
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400"}`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected fish preview"
            className="max-h-48 rounded-md object-contain"
          />
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Drag & drop a fish image here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, or WEBP — max 10MB
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {previewUrl && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="self-start text-xs text-red-600 hover:underline"
        >
          Remove image
        </button>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
