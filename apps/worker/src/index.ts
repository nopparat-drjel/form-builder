import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

import authRouter from "./routes/auth";
import formsRouter from "./routes/forms";
import responsesRouter from "./routes/responses";
import publicRouter from "./routes/public";

export interface Bindings {
  DB: D1Database;
  UPLOADS: R2Bucket;
  JWT_SECRET: string;
  RATE_LIMIT_KV: KVNamespace;
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// ─── Global middleware ─────────────────────────────────────────────────────

app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = [
        "http://localhost:5173",
        "https://hr-form-staging.pages.dev",
        "https://hr-form.pages.dev",
        "https://hr-form-prod.pages.dev",
        "https://hr-form-frontend.vercel.app",
      ];
      return allowed.includes(origin) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    credentials: true,
  })
);

app.use("*", secureHeaders());
app.use("*", logger());

// ─── Routers ───────────────────────────────────────────────────────────────

app.route("/api/auth", authRouter);
app.route("/api/forms", formsRouter);
app.route("/api/responses", responsesRouter);
app.route("/api/public", publicRouter);

// ─── Health check ──────────────────────────────────────────────────────────

app.get("/health", (c) =>
  c.json({ status: "ok", ts: Date.now(), env: c.env.JWT_SECRET ? "configured" : "missing-secret" })
);

// ─── 404 handler ──────────────────────────────────────────────────────────

app.notFound((c) => c.json({ success: false, error: "Not found" }, 404));

// ─── Error handler ────────────────────────────────────────────────────────

app.onError((err, c) => {
  console.error("[unhandled]", err.message);
  return c.json({ success: false, error: "Internal server error" }, 500);
});

export default app;
