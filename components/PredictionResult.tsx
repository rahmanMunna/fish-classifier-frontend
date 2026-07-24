"use client";

import { PredictResponse } from "@/types";

interface PredictionResultProps {
  result: PredictResponse | null;
}

export default function PredictionResult({ result }: PredictionResultProps) {
  if (!result) return null;

  const sortedProbabilities = Object.entries(result.probabilities).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="flex flex-col gap-4 rounded-md border border-gray-200 p-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Predicted Species
        </p>
        <p className="text-2xl font-bold text-gray-900">{result.prediction}</p>
        <p className="text-sm text-gray-500">
          Confidence: <b>{(result.confidence * 100).toFixed(2)}%</b>
        </p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>Model used: <b>{result.model_used}</b></span>
        <span>Inference time: <b>{result.inference_time.toFixed(1)} ms</b></span>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">
          Class Probability Breakdown
        </p>
        <div className="flex flex-col gap-1.5">
          {sortedProbabilities.map(([species, probability]) => (
            <div key={species} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-xs text-gray-600">
                {species}
              </span>
              <div className="h-2 flex-1 rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full ${
                    species === result.prediction ? "bg-blue-600" : "bg-gray-400"
                  }`}
                  style={{ width: `${Math.max(probability * 100, 1)}%` }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-xs text-gray-500">
                {(probability * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}