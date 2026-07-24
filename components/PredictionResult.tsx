"use client";

import { PredictResponse } from "@/types";

interface PredictionResultProps {
  result: PredictResponse | null;
}

export default function PredictionResult({ result }: PredictionResultProps) {
  if (!result) return null;

  const sorted = Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]);
  const confidencePct = result.confidence * 100;

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-card sm:p-7">
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-teal">
        Specimen Identified
      </p>

      <h3 className="mt-2 font-display text-3xl font-semibold italic text-ink sm:text-4xl">
        {result.prediction}
      </h3>

      {/* Confidence gauge — calibrated bar with tick marks, like a depth gauge */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-mono text-xs uppercase tracking-wide text-slate">
            Confidence
          </span>
          <span className="font-mono text-lg font-semibold text-teal">
            {confidencePct.toFixed(1)}%
          </span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-paper">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-teal-light to-teal transition-all"
            style={{ width: `${Math.max(confidencePct, 2)}%` }}
          />
          <div className="pointer-events-none absolute inset-0 flex justify-between px-[1px]">
            {Array.from({ length: 11 }).map((_, i) => (
              <span key={i} className="h-3 w-px bg-white/70" />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 font-mono text-xs text-slate">
        <span>
          MODEL <span className="text-ink">{result.model_used}</span>
        </span>
        <span>
          INFERENCE <span className="text-ink">{result.inference_time.toFixed(1)} ms</span>
        </span>
      </div>

      <div className="mt-6">
        <p className="mb-3 font-mono text-xs uppercase tracking-wide text-slate">
          Probability Breakdown
        </p>
        <div className="flex flex-col gap-2">
          {sorted.map(([species, probability]) => {
            const isTop = species === result.prediction;
            return (
              <div key={species} className="flex items-center gap-3">
                <span
                  className={`w-28 shrink-0 truncate text-xs ${
                    isTop ? "font-semibold text-ink" : "text-slate"
                  }`}
                >
                  {species}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-paper">
                  <div
                    className={`h-1.5 rounded-full ${isTop ? "bg-gold" : "bg-line"}`}
                    style={{ width: `${Math.max(probability * 100, 1)}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-xs text-slate">
                  {(probability * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}