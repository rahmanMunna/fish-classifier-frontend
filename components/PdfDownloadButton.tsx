"use client";

import { useState } from "react";
import { generatePdfReport } from "@/lib/api";
import { ApiError } from "@/types";

interface PdfDownloadButtonProps {
  file: File | null;
  modelName: string;
  disabled?: boolean;
}

export default function PdfDownloadButton({
  file,
  modelName,
  disabled = false,
}: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!file || !modelName) return;
    setLoading(true);
    setError(null);
    try {
      const blob = await generatePdfReport(file, modelName);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fish_report_${modelName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? typeof err.detail === "string"
            ? err.detail
            : "Failed to generate report."
          : "Something went wrong generating the report.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || !file || loading}
        className="inline-flex items-center gap-2 rounded-lg border border-teal px-4 py-2.5
                   text-sm font-semibold text-teal transition-colors
                   hover:bg-teal hover:text-white
                   disabled:cursor-not-allowed disabled:border-line disabled:text-slate-light disabled:hover:bg-transparent"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v12m0 0l-4-4m4 4l4-4M5 19h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {loading ? "Generating PDF…" : "Download PDF Report"}
      </button>
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}