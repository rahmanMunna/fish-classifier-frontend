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
        // Default to the first model if nothing is selected yet
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
      <div className="text-sm text-gray-500">
        Loading available models…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Could not load models: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="model-select" className="text-sm font-medium text-gray-700">
        Select Model
      </label>
      <select
        id="model-select"
        value={selectedModel}
        disabled={disabled}
        onChange={(e) => onSelectModel(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {models.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}