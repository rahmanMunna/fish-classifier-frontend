"use client";

import { useState } from "react";
import ModelSelector from "@/components/ModelSelector";
import ImageUploader from "@/components/ImageUploader";
import PredictionResult from "@/components/PredictionResult";
import GradCamViewer from "@/components/GradCamViewer";
import PdfDownloadButton from "@/components/PdfDownloadButton";
import { predictImage } from "@/lib/api";
import { ApiError, PredictResponse } from "@/types";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = (file: File | null) => {
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
    setResult(null);
    setError(null);
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    setResult(null);
    setError(null);
  };

  const handleClassify = async () => {
    if (!selectedFile || !selectedModel) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await predictImage(selectedFile, selectedModel);
      setResult(response);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? typeof err.detail === "string"
            ? err.detail
            : "Prediction failed. Please check the image and try again."
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canClassify = !!selectedFile && !!selectedModel && !loading;

  return (
    <main className="min-h-screen">
      <section className="scale-texture relative overflow-hidden bg-mist px-4 py-16 sm:py-20">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-teal">
            ICHTHYOLOGY&nbsp;&middot;&nbsp;COMPUTER VISION&nbsp;&middot;&nbsp;EXPLAINABLE AI
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold italic text-ink sm:text-5xl">
            Know your catch, instantly.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-slate sm:text-lg">
            Upload a photo of a carp and get a species prediction, a
            confidence score, and a visual explanation of exactly what the
            model looked at — in seconds.
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-surface px-4 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          {[
            { n: "01", title: "Upload", body: "Drop in a clear photo of a single fish." },
            { n: "02", title: "Analyze", body: "Pick a model and run the classifier." },
            { n: "03", title: "Explain", body: "See the confidence score and the Grad-CAM heatmap." },
          ].map((step) => (
            <div key={step.n} className="flex flex-col items-start gap-1">
              <span className="font-mono text-xs font-medium text-gold">{step.n}</span>
              <h3 className="font-display text-lg font-semibold text-ink">{step.title}</h3>
              <p className="text-sm text-slate">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-card sm:p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-xl font-semibold text-ink">Run a classification</h2>
            <span className="font-mono text-xs text-slate-light">8 carp species supported</span>
          </div>

          <div className="flex flex-col gap-5">
            <ModelSelector
              selectedModel={selectedModel}
              onSelectModel={handleModelChange}
              disabled={loading}
            />

            <ImageUploader onFileSelected={handleFileSelected} disabled={loading} />

            <button
              type="button"
              onClick={handleClassify}
              disabled={!canClassify}
              className="rounded-lg bg-teal px-4 py-3 text-sm font-semibold text-white
                         transition-colors hover:bg-teal-deep
                         disabled:cursor-not-allowed disabled:bg-slate-light disabled:text-white/70"
            >
              {loading ? "Classifying…" : "Classify Species"}
            </button>

            {error && (
              <p className="rounded-lg border border-error/20 bg-error-bg px-3 py-2.5 text-sm text-error">
                {error}
              </p>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-8 flex flex-col gap-8">
            <PredictionResult result={result} />
            <GradCamViewer gradcamBase64={result.gradcam} originalImageUrl={previewUrl} />
            <PdfDownloadButton file={selectedFile} modelName={selectedModel} disabled={loading} />
          </div>
        )}
      </section>

      <footer className="scale-texture border-t border-line bg-mist px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm italic text-slate">Carp Vision</p>
          <p className="mt-1 text-xs text-slate-light">
            A thesis project on explainable deep learning for freshwater carp species identification.
          </p>
        </div>
      </footer>
    </main>
  );
}