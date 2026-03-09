import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Bindings } from "../index";
import { rateLimit } from "../middleware/rateLimit";
import { queryOne, execute } from "../lib/db";
import { uploadToR2, generateR2Key } from "../lib/r2";
import type { DbShareToken, DbForm } from "../lib/db";
import { sendSubmissionNotification } from "../lib/email";

const router = new Hono<{ Bindings: Bindings }>();

// Rate limit public endpoints
router.use("*", rateLimit({ limit: 30, windowSec: 60, prefix: "public" }));

const submitSchema = z.object({
  applicant: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  data: z.record(z.unknown()),
});

// GET /api/public/forms/:token
router.get("/forms/:token", async (c) => {
  const token = c.req.param("token");
  const now = Date.now();

  const shareToken = await queryOne<DbShareToken>(
    c.env.DB,
    "SELECT * FROM share_tokens WHERE token = ?",
    [token]
  );

  if (!shareToken) {
    return c.json({ success: false, error: "Form not found" }, 404);
  }

  if (shareToken.expires_at && shareToken.expires_at < now) {
    return c.json({ success: false, error: "This form link has expired" }, 410);
  }

  const form = await queryOne<DbForm>(
    c.env.DB,
    "SELECT id, title, description, blocks, logo_url, active FROM forms WHERE id = ? AND active = 1",
    [shareToken.form_id]
  );

  if (!form) {
    return c.json({ success: false, error: "Form not available" }, 404);
  }

  return c.json({
    success: true,
    data: {
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        blocks: JSON.parse(form.blocks),
        logoUrl: form.logo_url,
      },
      token: shareToken.token,
      expiresAt: shareToken.expires_at,
    },
  });
});

// POST /api/public/forms/:token/submit
router.post(
  "/forms/:token/submit",
  zValidator("json", submitSchema),
  async (c) => {
    const token = c.req.param("token");
    const body = c.req.valid("json");
    const now = Date.now();

    const shareToken = await queryOne<
      DbShareToken & { tenant_id: string; form_title: string }
    >(
      c.env.DB,
      `SELECT st.*, f.tenant_id, f.title as form_title
       FROM share_tokens st
       JOIN forms f ON f.id = st.form_id
       WHERE st.token = ? AND f.active = 1`,
      [token]
    );

    if (!shareToken) {
      return c.json({ success: false, error: "Form not found" }, 404);
    }

    if (shareToken.expires_at && shareToken.expires_at < now) {
      return c.json({ success: false, error: "This form link has expired" }, 410);
    }

    const responseId = crypto.randomUUID();

    await execute(c.env.DB, `
      INSERT INTO responses
        (id, form_id, tenant_id, applicant, data, status, starred, submitted_at)
      VALUES (?, ?, ?, ?, ?, 'new', 0, ?)
    `, [
      responseId,
      shareToken.form_id,
      shareToken.tenant_id,
      JSON.stringify(body.applicant),
      JSON.stringify(body.data),
      now,
    ]);

    // Increment share_count
    await execute(
      c.env.DB,
      "UPDATE share_tokens SET share_count = share_count + 1 WHERE token = ?",
      [token]
    );

    // Fire-and-forget email notification
    void sendSubmissionNotification(c.env, {
      formTitle: shareToken.form_title ?? "แบบฟอร์ม",
      applicantName: body.applicant.name,
      applicantEmail: body.applicant.email,
      responseId,
      submittedAt: now,
    }).catch(() => {});

    return c.json(
      { success: true, data: { responseId, submittedAt: now } },
      201
    );
  }
);

// POST /api/public/upload
router.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  const responseId = formData.get("responseId")?.toString() ?? "unknown";

  if (!file || typeof file === "string") {
    return c.json({ success: false, error: "No file provided" }, 400);
  }

  const uploadedFile = file as File;
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (uploadedFile.size > MAX_SIZE) {
    return c.json({ success: false, error: "File too large (max 10 MB)" }, 413);
  }

  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!ALLOWED_TYPES.includes(uploadedFile.type)) {
    return c.json({ success: false, error: "File type not allowed" }, 415);
  }

  const key = generateR2Key("tenant", "form", responseId, uploadedFile.name);
  const buffer = await uploadedFile.arrayBuffer();
  await uploadToR2(c.env.UPLOADS, key, buffer, uploadedFile.type);

  const uploadId = crypto.randomUUID();
  await execute(c.env.DB, `
    INSERT INTO file_uploads (id, response_id, r2_key, mime_type, size_bytes, uploaded_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [uploadId, responseId, key, uploadedFile.type, uploadedFile.size, Date.now()]);

  return c.json({ success: true, data: { uploadId, key } }, 201);
});

export default router;
