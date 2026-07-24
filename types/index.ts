/**
 * Shared TypeScript types mirroring the FastAPI backend's Pydantic
 * response schemas (app/schemas/response.py on the backend).
 * Keep these in sync if the backend response shape ever changes.
 */

export interface ModelsResponse {
  models: string[];
}

export interface PredictResponse {
  prediction: string;
  confidence: number; // 0.0 - 1.0
  probabilities: Record<string, number>; // class name -> probability
  gradcam: string; // base64-encoded PNG, no data: prefix
  inference_time: number; // milliseconds
  model_used: string;
}

export interface ApiErrorResponse {
  detail: string | Record<string, unknown>[];
}

export class ApiError extends Error {
  status: number;
  detail: string | Record<string, unknown>[];

  constructor(status: number, detail: string | Record<string, unknown>[]) {
    super(typeof detail === "string" ? detail : "Request failed");
    this.status = status;
    this.detail = detail;
    this.name = "ApiError";
  }
}