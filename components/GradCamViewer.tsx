"use client";

import { useState } from "react";

interface GradCamViewerProps {
  gradcamBase64: string | null; // raw base64 string, no "data:image/png;base64," prefix
  originalImageUrl: string | null; // object URL from ImageUploader's preview
}

type ViewMode = "gradcam" | "original" | "side-by-side";

export default function GradCamViewer({
  gradcamBase64,
  originalImageUrl,
}: GradCamViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");

  if (!gradcamBase64) return null;

  const gradcamSrc = `data:image/png;base64,${gradcamBase64}`;

  return (
    <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Grad-CAM Heatmap (Explainability)
        </p>

        <div className="flex gap-1 rounded-md bg-gray-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("original")}
            className={`rounded px-2 py-1 ${
              viewMode === "original"
                ? "bg-white shadow font-medium"
                : "text-gray-500"
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setViewMode("gradcam")}
            className={`rounded px-2 py-1 ${
              viewMode === "gradcam"
                ? "bg-white shadow font-medium"
                : "text-gray-500"
            }`}
          >
            Heatmap
          </button>
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={`rounded px-2 py-1 ${
              viewMode === "side-by-side"
                ? "bg-white shadow font-medium"
                : "text-gray-500"
            }`}
          >
            Side-by-side
          </button>
        </div>
      </div>

      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center gap-1">
            {originalImageUrl && (
              <img
                src={originalImageUrl}
                alt="Original upload"
                className="max-h-56 rounded-md object-contain"
              />
            )}
            <span className="text-xs text-gray-400">Original</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <img
              src={gradcamSrc}
              alt="Grad-CAM heatmap"
              className="max-h-56 rounded-md object-contain"
            />
            <span className="text-xs text-gray-400">Grad-CAM Heatmap</span>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <img
            src={
              viewMode === "original" ? (originalImageUrl ?? "") : gradcamSrc
            }
            alt={
              viewMode === "original" ? "Original upload" : "Grad-CAM heatmap"
            }
            className="max-h-72 rounded-md object-contain"
          />
        </div>
      )}

      <p className="text-xs text-gray-400">
        The heatmap highlights the image regions that most influenced the
        model&apos;s prediction. Warmer colors (red/yellow) indicate higher
        influence.
      </p>
    </div>
  );
}
