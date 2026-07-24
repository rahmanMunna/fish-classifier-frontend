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

      // Trigger a real browser download without navigating away
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
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={disabled || !file || loading}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white
                   hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Generating PDF…" : "📄 Download PDF Report"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}