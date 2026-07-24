"use client";

import { useState } from "react";

interface GradCamViewerProps {
  gradcamBase64: string | null;
  originalImageUrl: string | null;
}

type ViewMode = "gradcam" | "original" | "side-by-side";

export default function GradCamViewer({
  gradcamBase64,
  originalImageUrl,
}: GradCamViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");

  if (!gradcamBase64) return null;

  const gradcamSrc = `data:image/png;base64,${gradcamBase64}`;

  const tabs: { key: ViewMode; label: string }[] = [
    { key: "original", label: "Original" },
    { key: "gradcam", label: "Heatmap" },
    { key: "side-by-side", label: "Compare" },
  ];

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-teal">
          Grad-CAM Explainability
        </p>

        <div className="flex gap-1 rounded-lg bg-bg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setViewMode(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === tab.key
                  ? "bg-white text-ink shadow-sm"
                  : "text-slate hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="specimen-frame flex flex-col items-center gap-2 rounded-lg bg-bg p-3">
            {originalImageUrl && (
              <img
                src={originalImageUrl}
                alt="Original upload"
                className="max-h-56 rounded object-contain"
              />
            )}
            <span className="font-mono text-[11px] text-slate">Original</span>
          </div>
          <div className="specimen-frame flex flex-col items-center gap-2 rounded-lg bg-bg p-3">
            <img
              src={gradcamSrc}
              alt="Grad-CAM heatmap"
              className="max-h-56 rounded object-contain"
            />
            <span className="font-mono text-[11px] text-slate">Heatmap</span>
          </div>
        </div>
      ) : (
        <div className="specimen-frame flex justify-center rounded-lg bg-bg p-4">
          <img
            src={viewMode === "original" ? (originalImageUrl ?? "") : gradcamSrc}
            alt={viewMode === "original" ? "Original upload" : "Grad-CAM heatmap"}
            className="max-h-72 rounded object-contain"
          />
        </div>
      )}

      <p className="mt-4 text-xs text-slate">
        Warmer tones (red/yellow) mark the regions that most influenced the
        model&apos;s decision — a quick visual check on whether it&apos;s
        looking at the fish, not the background.
      </p>
    </div>
  );
}