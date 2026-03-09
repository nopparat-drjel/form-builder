import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Bindings } from "../index";
import { authMiddleware } from "../middleware/auth";
import { queryAll, queryOne, execute, queryPaginated } from "../lib/db";
import type { DbResponse } from "../lib/db";

const router = new Hono<{ Bindings: Bindings }>();

router.use("*", authMiddleware);

const updateResponseSchema = z.object({
  status: z.enum(["new", "reviewing", "approved", "rejected"]).optional(),
  starred: z.boolean().optional(),
});

// GET /api/responses
router.get("/", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const page = parseInt(c.req.query("page") ?? "1");
  const pageSize = parseInt(c.req.query("pageSize") ?? "20");
  const status = c.req.query("status");
  const formId = c.req.query("formId");
  const starred = c.req.query("starred");

  let query = "SELECT * FROM responses WHERE tenant_id = ?";
  const params: unknown[] = [tenantId];

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (formId) {
    query += " AND form_id = ?";
    params.push(formId);
  }
  if (starred === "true") {
    query += " AND starred = 1";
  }

  query += " ORDER BY submitted_at DESC";

  const { items, hasMore } = await queryPaginated<DbResponse>(
    c.env.DB,
    query,
    params,
    page,
    pageSize
  );

  const responses = items.map((r) => ({
    ...r,
    applicant: JSON.parse(r.applicant),
    data: JSON.parse(r.data),
    starred: r.starred === 1,
  }));

  return c.json({ success: true, data: { responses, hasMore, page, pageSize } });
});

// GET /api/responses/:id
router.get("/:id", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const responseId = c.req.param("id");

  const response = await queryOne<DbResponse>(
    c.env.DB,
    "SELECT * FROM responses WHERE id = ? AND tenant_id = ?",
    [responseId, tenantId]
  );

  if (!response) {
    return c.json({ success: false, error: "Response not found" }, 404);
  }

  return c.json({
    success: true,
    data: {
      ...response,
      applicant: JSON.parse(response.applicant),
      data: JSON.parse(response.data),
      starred: response.starred === 1,
    },
  });
});

// PATCH /api/responses/:id
router.patch("/:id", zValidator("json", updateResponseSchema), async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const responseId = c.req.param("id");
  const body = c.req.valid("json");

  const existing = await queryOne<{ id: string }>(
    c.env.DB,
    "SELECT id FROM responses WHERE id = ? AND tenant_id = ?",
    [responseId, tenantId]
  );

  if (!existing) {
    return c.json({ success: false, error: "Response not found" }, 404);
  }

  const now = Date.now();
  const updates: string[] = [];
  const params: unknown[] = [];

  if (body.status !== undefined) {
    updates.push("status = ?");
    params.push(body.status);

    if (body.status === "reviewing") {
      updates.push("reviewed_at = ?");
      params.push(now);
    }
    if (body.status === "approved") {
      updates.push("approved_at = ?");
      params.push(now);
    }
  }

  if (body.starred !== undefined) {
    updates.push("starred = ?");
    params.push(body.starred ? 1 : 0);
  }

  if (updates.length === 0) {
    return c.json({ success: false, error: "No fields to update" }, 400);
  }

  params.push(responseId, tenantId);
  await execute(
    c.env.DB,
    `UPDATE responses SET ${updates.join(", ")} WHERE id = ? AND tenant_id = ?`,
    params
  );

  return c.json({ success: true, data: { id: responseId, updatedAt: now } });
});

// DELETE /api/responses/:id
router.delete("/:id", async (c) => {
  const { tenantId } = c.get("jwtPayload");
  const responseId = c.req.param("id");

  await execute(
    c.env.DB,
    "DELETE FROM responses WHERE id = ? AND tenant_id = ?",
    [responseId, tenantId]
  );

  return c.json({ success: true, data: null });
});

export default router;
