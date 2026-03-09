import api from "@/lib/api";
import type { Form, Block } from "@/lib/types";

// ─── Response shapes ─────────────────────────────────────────────────────────

interface FormsListData {
  forms: Form[];
  hasMore: boolean;
  page: number;
}

interface CreateFormData {
  id: string;
}

interface UpdateFormData {
  id: string;
  updatedAt: number;
}

interface ShareFormData {
  token: string;
  shareUrl: string;
}

// ─── Query functions ──────────────────────────────────────────────────────────

export async function fetchForms(): Promise<FormsListData> {
  const { data } = await api.get<{ success: boolean; data: FormsListData }>(
    "/api/forms"
  );
  return data.data;
}

export async function fetchForm(id: string): Promise<Form> {
  const { data } = await api.get<{ success: boolean; data: Form }>(
    `/api/forms/${id}`
  );
  return data.data;
}

export async function createForm(payload: {
  title: string;
  description?: string;
  blocks?: Block[];
}): Promise<CreateFormData> {
  const { data } = await api.post<{ success: boolean; data: CreateFormData }>(
    "/api/forms",
    payload
  );
  return data.data;
}

export async function updateForm(
  id: string,
  payload: {
    title?: string;
    description?: string;
    logoUrl?: string;
    blocks?: Block[];
    active?: boolean;
  }
): Promise<UpdateFormData> {
  const { data } = await api.put<{ success: boolean; data: UpdateFormData }>(
    `/api/forms/${id}`,
    payload
  );
  return data.data;
}

export async function deleteForm(id: string): Promise<void> {
  await api.delete(`/api/forms/${id}`);
}

export async function shareForm(
  id: string,
  expiresInSeconds: number
): Promise<ShareFormData> {
  const { data } = await api.post<{ success: boolean; data: ShareFormData }>(
    `/api/forms/${id}/share`,
    { expiresIn: expiresInSeconds }
  );
  return data.data;
}
