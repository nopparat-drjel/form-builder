// ─── Block types ─────────────────────────────────────────────────────────────

export enum BlockType {
  ShortText = "short_text",
  LongText = "long_text",
  Number = "number",
  Email = "email",
  Phone = "phone",
  Date = "date",
  Dropdown = "dropdown",
  Radio = "radio",
  Checkbox = "checkbox",
  FileUpload = "file_upload",
  SectionHeader = "section_header",
}

export interface BaseBlock {
  id: string;
  type: BlockType;
  label: string;
  required: boolean;
  helpText?: string;
  order: number;
}

export interface TextBlock extends BaseBlock {
  type:
    | BlockType.ShortText
    | BlockType.LongText
    | BlockType.Email
    | BlockType.Phone;
  placeholder?: string;
}

export interface NumberBlock extends BaseBlock {
  type: BlockType.Number;
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface DateBlock extends BaseBlock {
  type: BlockType.Date;
  minDate?: string;
  maxDate?: string;
}

export interface ChoiceBlock extends BaseBlock {
  type: BlockType.Dropdown | BlockType.Radio | BlockType.Checkbox;
  options: string[];
  multiple?: boolean;
}

export interface FileUploadBlock extends BaseBlock {
  type: BlockType.FileUpload;
  acceptedTypes: string[];
  maxSizeMb: number;
}

export interface SectionHeaderBlock extends BaseBlock {
  type: BlockType.SectionHeader;
  subtitle?: string;
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

// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = "hr_admin" | "viewer";

export interface User {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
}
