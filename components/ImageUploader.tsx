"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  onFileSelected: (file: File | null) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

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
        setError("Unsupported file type. Use JPG, PNG, or WEBP.");
        onFileSelected(null);
        setPreviewUrl(null);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("File too large. Max size is 10 MB.");
        onFileSelected(null);
        setPreviewUrl(null);
        return;
      }

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    validateAndSetFile(e.target.files?.[0]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) validateAndSetFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleClear = () => {
    validateAndSetFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-xs uppercase tracking-wide text-slate">
        Fish Photo
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex min-h-[9.5rem] cursor-pointer flex-col items-center justify-center
          rounded-lg border-2 border-dashed p-6 text-center transition-colors
          ${isDragging ? "border-teal bg-teal/5" : "border-line bg-bg"}
          ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-teal-light hover:bg-teal/5"}`}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected fish preview"
            className="max-h-40 rounded-md object-contain"
          />
        ) : (
          <>
            <svg
              className="mb-2 h-7 w-7 text-teal-light"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 16.5V18a2 2 0 002 2h12a2 2 0 002-2v-1.5M12 3v12m0-12l-4 4m4-4l4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm font-medium text-ink">
              Drag & drop, or click to browse
            </p>
            <p className="mt-0.5 font-mono text-xs text-slate-light">
              JPG · PNG · WEBP — max 10MB
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
          className="self-start font-mono text-xs text-teal-deep hover:underline"
        >
          Remove photo
        </button>
      )}

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
