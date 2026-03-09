import type { Context, Next } from "hono";
import type { Bindings } from "../index";

interface RateLimitOptions {
  /** Maximum requests in the window */
  limit: number;
  /** Window size in seconds */
  windowSec: number;
  /** KV key prefix */
  prefix?: string;
}

/**
 * KV-backed sliding window rate limiter for public routes.
 * Falls back gracefully if KV is unavailable (CI / local dev).
 */
export function rateLimit(opts: RateLimitOptions) {
  return async function rateLimitMiddleware(
    c: Context<{ Bindings: Bindings }>,
    next: Next
  ) {
    const kv = c.env.RATE_LIMIT_KV;
    if (!kv) {
      // KV not bound — skip in local dev
      await next();
      return;
    }

    const ip =
      c.req.header("CF-Connecting-IP") ??
      c.req.header("X-Forwarded-For") ??
      "unknown";

    const prefix = opts.prefix ?? "rl";
    const windowStart = Math.floor(Date.now() / 1000 / opts.windowSec);
    const key = `${prefix}:${ip}:${windowStart}`;

    const raw = await kv.get(key);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= opts.limit) {
      return c.json(
        { success: false, error: "Too many requests" },
        429,
        {
          "Retry-After": String(opts.windowSec),
          "X-RateLimit-Limit": String(opts.limit),
          "X-RateLimit-Remaining": "0",
        }
      );
    }

    await kv.put(key, String(count + 1), { expirationTtl: opts.windowSec * 2 });

    c.header("X-RateLimit-Limit", String(opts.limit));
    c.header("X-RateLimit-Remaining", String(opts.limit - count - 1));

    await next();
  };
}
