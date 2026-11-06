import { createUpstashLimit } from "../config/upstash.js";

const RATE_LIMITER_TIMEOUT_MS = 700;

const withTimeout = (promise, timeoutMs) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Rate limiter timeout after ${timeoutMs}ms`)), timeoutMs)),
  ]);

// Site-wide cap per IP through Upstash, as in Alizone. Skipped when Upstash isn't configured, and fails
// open if Upstash is unreachable so the whole API doesn't go down with it.
export default function createRateLimiter() {
  const ratelimit = createUpstashLimit();
  return async function rateLimiter(req, res, next) {
    if (!ratelimit) return next();
    try {
      const { success } = await withTimeout(ratelimit.limit(req.ip || "anonymous"), RATE_LIMITER_TIMEOUT_MS);
      if (!success)
        return res.status(429).json({ success: false, code: "rate_limited", message: "Too many requests. Please slow down." });
      next();
    } catch (error) {
      console.warn("Rate limiting unavailable, allowing request:", error.message);
      next();
    }
  };
}
