// ─── Block types ─────────────────────────────────────────────────────────────

export type BlockType =
  | "short_text"
  | "long_text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "file_upload"
  | "section_header";

export interface BaseBlock {
  id: string;
  type: BlockType;
  label: string;
  required: boolean;
  helpText?: string;
  order: number;
}

export interface ChoiceBlock extends BaseBlock {
  type: "dropdown" | "radio" | "checkbox";
  options: string[];
  multiple?: boolean;
}

export interface FileUploadBlock extends BaseBlock {
  type: "file_upload";
  acceptedTypes: string[];
  maxSizeMb: number;
}

export interface SectionHeaderBlock extends BaseBlock {
  type: "section_header";
  subtitle?: string;
}

export interface TextBlock extends BaseBlock {
  type: "short_text" | "long_text" | "email" | "phone";
  placeholder?: string;
}

export interface NumberBlock extends BaseBlock {
  type: "number";
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface DateBlock extends BaseBlock {
  type: "date";
  minDate?: string;
  maxDate?: string;
}

export type Block =
  | TextBlock
  | NumberBlock
  | DateBlock
  | ChoiceBlock
  | FileUploadBlock
  | SectionHeaderBlock;

// ─── Form ────────────────────────────────────────────────────────────────────

export interface Form {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  blocks: Block[];
  logoUrl?: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Share token ─────────────────────────────────────────────────────────────

export interface ShareToken {
  token: string;
  formId: string;
  expiresAt?: number;
  createdAt: number;
  shareCount: number;
}

// ─── Response ────────────────────────────────────────────────────────────────

export type ResponseStatus = "new" | "reviewing" | "approved" | "rejected";

export interface Applicant {
  name?: string;
  email?: string;
  phone?: string;
}

export interface Response {
  id: string;
  formId: string;
  tenantId: string;
  applicant: Applicant;
  data: Record<string, unknown>;
  status: ResponseStatus;
  starred: boolean;
  submittedAt: number;
  reviewedAt?: number;
  approvedAt?: number;
}

// ─── User / Auth ─────────────────────────────────────────────────────────────

export type UserRole = "hr_admin" | "viewer";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ─── API response wrappers ───────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
