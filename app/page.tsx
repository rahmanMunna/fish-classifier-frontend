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
    // A new image invalidates any previous result — avoids showing a
    // stale prediction/heatmap next to a newly selected image.
    setResult(null);
    setError(null);
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    // Switching models also invalidates the previous result for the
    // same reason — the result on screen must match what's selected.
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
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          🐟 Fish Species Classifier
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload a fish image, choose a model, and get a prediction with a
          Grad-CAM explainability heatmap.
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 p-5">
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
          className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
                     hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Classifying…" : "🔍 Classify"}
        </button>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {result && (
        <section className="flex flex-col gap-6">
          <PredictionResult result={result} />

          <GradCamViewer
            gradcamBase64={result.gradcam}
            originalImageUrl={previewUrl}
          />

          <PdfDownloadButton
            file={selectedFile}
            modelName={selectedModel}
            disabled={loading}
          />
        </section>
      )}
    </main>
  );
}