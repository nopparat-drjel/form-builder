import api from "@/lib/api";
import type { Response, ResponseStatus, Applicant } from "@/lib/types";

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface ResponsesListData {
  responses: Response[];
  hasMore: boolean;
  page: number;
}

export interface ResponsesParams {
  status?: ResponseStatus | "all";
  formId?: string;
  starred?: boolean;
  page?: number;
  pageSize?: number;
}

export interface SubmitPublicFormPayload {
  applicant: Applicant;
  data: Record<string, unknown>;
}

export interface SubmitPublicFormResult {
  responseId: string;
  submittedAt: number;
}

export interface PublicFormData {
  form: {
    id: string;
    title: string;
    description?: string;
    blocks: import("@/lib/types").Block[];
    logoUrl?: string;
  };
  token: string;
  expiresAt?: number;
}

// ─── Admin API functions (JWT via axios instance) ─────────────────────────────

export async function fetchResponses(
  params: ResponsesParams = {}
): Promise<ResponsesListData> {
  const { status, formId, starred, page, pageSize } = params;

  const query: Record<string, string> = {};
  if (status && status !== "all") query.status = status;
  if (formId) query.formId = formId;
  if (starred !== undefined) query.starred = String(starred);
  if (page !== undefined) query.page = String(page);
  if (pageSize !== undefined) query.pageSize = String(pageSize);

  const { data } = await api.get<{
    success: boolean;
    data: ResponsesListData;
  }>("/api/responses", { params: query });

  return data.data;
}

export async function fetchResponse(id: string): Promise<Response> {
  const { data } = await api.get<{ success: boolean; data: Response }>(
    `/api/responses/${id}`
  );
  return data.data;
}

export async function updateResponse(
  id: string,
  patch: { status?: ResponseStatus; starred?: boolean }
): Promise<void> {
  await api.patch(`/api/responses/${id}`, patch);
}

export async function deleteResponse(id: string): Promise<void> {
  await api.delete(`/api/responses/${id}`);
}

// ─── Typed HTTP error ─────────────────────────────────────────────────────────

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "HttpError";
  }
}

// ─── Public API functions (plain fetch, no auth) ──────────────────────────────

const PUBLIC_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function fetchPublicForm(token: string): Promise<PublicFormData> {
  const res = await fetch(
    `${PUBLIC_BASE_URL}/api/public/forms/${token}`
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new HttpError(
      (errorData as { error?: string }).error ?? "Failed to load form",
      res.status
    );
  }

  const json = (await res.json()) as { success: boolean; data: PublicFormData };
  return json.data;
}

export async function submitPublicForm(
  token: string,
  payload: SubmitPublicFormPayload
): Promise<SubmitPublicFormResult> {
  const res = await fetch(
    `${PUBLIC_BASE_URL}/api/public/forms/${token}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string }).error ?? "Failed to submit form"
    );
  }

  const json = (await res.json()) as {
    success: boolean;
    data: SubmitPublicFormResult;
  };
  return json.data;
}
