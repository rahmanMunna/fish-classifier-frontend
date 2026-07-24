/**
 * Typed API client for the FastAPI backend.
 *
 * Wraps GET /models, POST /predict, POST /generate-pdf.
 * All functions throw ApiError on non-2xx responses, so callers (React
 * components) can use a single try/catch and read err.detail for display.
 *
 * NOTE: "ngrok-skip-browser-warning" header is required while using an
 * ngrok tunnel for the backend — without it, ngrok's free-tier interstitial
 * warning page intercepts the request and returns HTML instead of JSON,
 * which looks like a CORS error in the browser. Harmless to leave in even
 * after moving off ngrok (a real backend will just ignore an unknown header).
 */

import { ApiError, ModelsResponse, PredictResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (see .env.example)."
  );
}

const NGROK_HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail: string | Record<string, unknown>[] = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response wasn't JSON — keep the generic message
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

/** GET /models — list of available model display names. */
export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_URL}/models`, {
    cache: "no-store",
    headers: NGROK_HEADERS,
  });
  return handleResponse<ModelsResponse>(res);
}

/** POST /predict — upload image + model_name, get prediction + gradcam. */
export async function predictImage(
  file: File,
  modelName: string
): Promise<PredictResponse> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("model_name", modelName);

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: NGROK_HEADERS,
    body: formData,
  });
  return handleResponse<PredictResponse>(res);
}

/**
 * POST /generate-pdf — upload the same image + model_name, get back a
 * PDF Blob to trigger a browser download.
 */
export async function generatePdfReport(
  file: File,
  modelName: string
): Promise<Blob> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("model_name", modelName);

  const res = await fetch(`${API_URL}/generate-pdf`, {
    method: "POST",
    headers: NGROK_HEADERS,
    body: formData,
  });

  if (!res.ok) {
    let detail: string | Record<string, unknown>[] = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      // response was the PDF or non-JSON error — keep generic message
    }
    throw new ApiError(res.status, detail);
  }

  return res.blob();
}