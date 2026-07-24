"use client";

import { useEffect, useState } from "react";
import { fetchModels } from "@/lib/api";
import { ApiError } from "@/types";

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (modelName: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onSelectModel,
  disabled = false,
}: ModelSelectorProps) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchModels()
      .then((data) => {
        if (cancelled) return;
        setModels(data.models);
        if (data.models.length > 0 && !selectedModel) {
          onSelectModel(data.models[0]);
        }
      })
      .catch((err: ApiError) => {
        if (cancelled) return;
        setError(err.message || "Failed to load models.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
        Loading available models…
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-lg border border-error/20 bg-error-bg px-3 py-2 text-sm text-error">
        Could not load models: {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="model-select"
        className="font-mono text-xs uppercase tracking-wide text-slate"
      >
        Model
      </label>
      <div className="relative">
        <select
          id="model-select"
          value={selectedModel}
          disabled={disabled}
          onChange={(e) => onSelectModel(e.target.value)}
          className="w-full appearance-none rounded-lg border border-line bg-white px-3.5 py-2.5
                     text-sm font-medium text-ink outline-none transition-colors
                     focus:border-teal focus:ring-2 focus:ring-teal/20
                     disabled:cursor-not-allowed disabled:bg-paper disabled:text-slate-light"
        >
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate"
          viewBox="0 0 12 8"
          fill="none"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
