import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { compare } from "bcryptjs";
import type { Bindings } from "../index";
import { queryOne } from "../lib/db";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyJwt,
} from "../lib/jwt";
import type { DbUser } from "../lib/db";

const router = new Hono<{ Bindings: Bindings }>();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// POST /api/auth/login
router.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await queryOne<DbUser>(
    c.env.DB,
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!user) {
    return c.json({ success: false, error: "Invalid credentials" }, 401);
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return c.json({ success: false, error: "Invalid credentials" }, 401);
  }

  const [accessToken, refreshToken] = await Promise.all([
    generateAccessToken(user.id, user.tenant_id, user.email, user.role, c.env.JWT_SECRET),
    generateRefreshToken(user.id, user.tenant_id, user.email, user.role, c.env.JWT_SECRET),
  ]);

  return c.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        tenantId: user.tenant_id,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// POST /api/auth/refresh
router.post("/refresh", zValidator("json", refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid("json");

  try {
    const payload = await verifyJwt(refreshToken, c.env.JWT_SECRET);

    if (payload.type !== "refresh") {
      return c.json({ success: false, error: "Invalid token type" }, 401);
    }

    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateAccessToken(
        payload.sub,
        payload.tenantId,
        payload.email,
        payload.role,
        c.env.JWT_SECRET
      ),
      generateRefreshToken(
        payload.sub,
        payload.tenantId,
        payload.email,
        payload.role,
        c.env.JWT_SECRET
      ),
    ]);

    return c.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch {
    return c.json({ success: false, error: "Token expired or invalid" }, 401);
  }
});

// DELETE /api/auth/logout
router.delete("/logout", async (c) => {
  // Stateless JWT: client clears tokens. Can add a denylist via KV here.
  return c.json({ success: true, data: null });
});

export default router;
