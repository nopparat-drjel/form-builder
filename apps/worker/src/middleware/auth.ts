import type { Context, Next } from "hono";
import { verifyJwt } from "../lib/jwt";
import type { Bindings } from "../index";

export interface JwtPayload {
  sub: string;
  tenantId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

// Extend Hono context variables
declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: JwtPayload;
  }
}

export async function authMiddleware(
  c: Context<{ Bindings: Bindings }>,
  next: Next
) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyJwt(token, c.env.JWT_SECRET);

    if (payload.type !== "access") {
      return c.json({ success: false, error: "Invalid token type" }, 401);
    }

    c.set("jwtPayload", payload as JwtPayload);
    await next();
  } catch {
    return c.json({ success: false, error: "Token expired or invalid" }, 401);
  }
}
