import { rateLimit } from "express-rate-limit";

// Per-route limits for auth, kept in memory (one server). The global Upstash limiter in
// rateLimiter.js is a separate, optional, site-wide cap.
const tooMany = (message) => (_req, res) =>
  res.status(429).json({ success: false, code: "rate_limited", message });

const accountKey = (req) => `acct:${String(req.body?.email ?? "").trim().toLowerCase()}`;

export function createAuthLimits() {
  const MIN = 60 * 1000;
  return {
    // 5 new accounts an hour from one address. Rejected sign-ups (bad fields) don't count.
    signup: rateLimit({
      windowMs: 60 * MIN,
      limit: 5,
      skipFailedRequests: true,
      handler: tooMany("Too many sign-ups from here. Try again in an hour."),
    }),
    // Wrong passwords: 10 per 15 minutes per address, and 10 per account from anywhere.
    loginByIp: rateLimit({
      windowMs: 15 * MIN,
      limit: 10,
      skipSuccessfulRequests: true,
      handler: tooMany("Too many tries. Wait a few minutes and try again."),
    }),
    loginByAccount: rateLimit({
      windowMs: 15 * MIN,
      limit: 10,
      skipSuccessfulRequests: true,
      keyGenerator: accountKey,
      handler: tooMany("Too many tries. Wait a few minutes and try again."),
    }),
  };
}
