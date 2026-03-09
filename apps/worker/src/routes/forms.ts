import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Bindings } from "../index";
import { authMiddleware } from "../middleware/auth";
import { queryAll, queryOne, execute, queryPaginated } from "../lib/db";
import type { DbForm, DbShareToken } from "../lib/db";

const router = new Hono<{ Bindings: Bindings }>();

// All form routes require auth
router.use("*", authMiddleware);

const createFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  blocks: z.array(z.record(z.unknown())).default([]),
  logoUrl: z.string().url().optional(),
});

const updateFormSchema = createFormSchema.partial();

// GET /api/forms
router.get("/", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const page = parseInt(c.req.query("page") ?? "1");
  const pageSize = parseInt(c.req.query("pageSize") ?? "20");
  const active = c.req.query("active");

  let query = "SELECT * FROM forms WHERE tenant_id = ?";
  const params: unknown[] = [tenantId];

  if (active !== undefined) {
    query += " AND active = ?";
    params.push(active === "true" ? 1 : 0);
  }

  query += " ORDER BY updated_at DESC";

  const { items, hasMore } = await queryPaginated<DbForm>(
    c.env.DB,
    query,
    params,
    page,
    pageSize
  );

  const forms = items.map((f) => ({
    ...f,
    blocks: JSON.parse(f.blocks),
    active: f.active === 1,
  }));

  return c.json({ success: true, data: { forms, hasMore, page, pageSize } });
});

// POST /api/forms
router.post("/", zValidator("json", createFormSchema), async (c) => {
  const { tenantId, sub: userId } = c.get("jwtPayload");
  const body = c.req.valid("json");
  const now = Date.now();
  const id = crypto.randomUUID();

  await execute(c.env.DB, `
    INSERT INTO forms (id, tenant_id, title, description, blocks, logo_url, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  `, [
    id,
    tenantId,
    body.title,
    body.description ?? null,
    JSON.stringify(body.blocks),
    body.logoUrl ?? null,
    now,
    now,
  ]);

  return c.json(
    { success: true, data: { id, tenantId, userId, createdAt: now } },
    201
  );
});

// GET /api/forms/:id
router.get("/:id", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const formId = c.req.param("id");

  const form = await queryOne<DbForm>(
    c.env.DB,
    "SELECT * FROM forms WHERE id = ? AND tenant_id = ?",
    [formId, tenantId]
  );

  if (!form) return c.json({ success: false, error: "Form not found" }, 404);

  return c.json({
    success: true,
    data: { ...form, blocks: JSON.parse(form.blocks), active: form.active === 1 },
  });
});

// PUT /api/forms/:id
router.put("/:id", zValidator("json", updateFormSchema), async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const formId = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<DbForm>(
    c.env.DB,
    "SELECT id FROM forms WHERE id = ? AND tenant_id = ?",
    [formId, tenantId]
  );

  if (!existing) return c.json({ success: false, error: "Form not found" }, 404);

  const now = Date.now();
  await execute(c.env.DB, `
    UPDATE forms SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      blocks = COALESCE(?, blocks),
      logo_url = COALESCE(?, logo_url),
      updated_at = ?
    WHERE id = ? AND tenant_id = ?
  `, [
    body.title ?? null,
    body.description ?? null,
    body.blocks ? JSON.stringify(body.blocks) : null,
    body.logoUrl ?? null,
    now,
    formId,
    tenantId,
  ]);

  return c.json({ success: true, data: { id: formId, updatedAt: now } });
});

// DELETE /api/forms/:id
router.delete("/:id", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const formId = c.req.param("id");

  await execute(
    c.env.DB,
    "DELETE FROM forms WHERE id = ? AND tenant_id = ?",
    [formId, tenantId]
  );

  return c.json({ success: true, data: null });
});

// POST /api/forms/:id/share
router.post("/:id/share", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const formId = c.req.param("id");

  const form = await queryOne<{ id: string }>(
    c.env.DB,
    "SELECT id FROM forms WHERE id = ? AND tenant_id = ?",
    [formId, tenantId]
  );

  if (!form) return c.json({ success: false, error: "Form not found" }, 404);

  const body = await c.req.json<{ expiresIn?: number }>().catch(() => ({} as { expiresIn?: number }));
  const token = crypto.randomUUID().replace(/-/g, "");
  const now = Date.now();
  const expiresAt = body.expiresIn ? now + body.expiresIn * 1000 : null;

  await execute(c.env.DB, `
    INSERT INTO share_tokens (token, form_id, expires_at, created_at, share_count)
    VALUES (?, ?, ?, ?, 0)
  `, [token, formId, expiresAt, now]);

  return c.json({
    success: true,
    data: { token, formId, expiresAt, shareUrl: `/f/${token}` },
  }, 201);
});

export default router;
