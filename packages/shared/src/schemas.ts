import { z } from "zod";
import { BlockType } from "./types";

// ─── Block schemas ────────────────────────────────────────────────────────────

const baseBlockSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).max(200),
  required: z.boolean(),
  helpText: z.string().max(500).optional(),
  order: z.number().int().min(0),
});

export const textBlockSchema = baseBlockSchema.extend({
  type: z.enum([
    BlockType.ShortText,
    BlockType.LongText,
    BlockType.Email,
    BlockType.Phone,
  ]),
  placeholder: z.string().max(200).optional(),
});

export const numberBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.Number),
  placeholder: z.string().max(200).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export const dateBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.Date),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
});

export const choiceBlockSchema = baseBlockSchema.extend({
  type: z.enum([BlockType.Dropdown, BlockType.Radio, BlockType.Checkbox]),
  options: z.array(z.string().min(1)).min(1).max(50),
  multiple: z.boolean().optional(),
});

export const fileUploadBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.FileUpload),
  acceptedTypes: z.array(z.string()).min(1),
  maxSizeMb: z.number().min(1).max(50),
});

export const sectionHeaderBlockSchema = baseBlockSchema.extend({
  type: z.literal(BlockType.SectionHeader),
  subtitle: z.string().max(300).optional(),
});

export const blockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  numberBlockSchema,
  dateBlockSchema,
  choiceBlockSchema,
  fileUploadBlockSchema,
  sectionHeaderBlockSchema,
]);

// ─── Form schemas ─────────────────────────────────────────────────────────────

export const createFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  blocks: z.array(blockSchema).default([]),
  logoUrl: z.string().url().optional(),
});

export const updateFormSchema = createFormSchema.partial();

// ─── Auth schemas ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ─── Response schemas ─────────────────────────────────────────────────────────

export const applicantSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
});

export const submitResponseSchema = z.object({
  applicant: applicantSchema,
  data: z.record(z.unknown()),
});

export const updateResponseSchema = z.object({
  status: z.enum(["new", "reviewing", "approved", "rejected"]).optional(),
  starred: z.boolean().optional(),
});

// ─── Share token schemas ──────────────────────────────────────────────────────

export const createShareTokenSchema = z.object({
  expiresIn: z.number().int().positive().optional(), // seconds
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
