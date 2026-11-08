import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Optional site-wide limit, as in Alizone. Without the two UPSTASH_* variables it is off.
const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? "").replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export function createUpstashLimit() {
  const hasRedisEnv = Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);
  if (!hasRedisEnv) return null;
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      parsePositiveInt(process.env.RATE_LIMIT_REQUESTS, 100),
      `${parsePositiveInt(process.env.RATE_LIMIT_DURATION, 60)} s`,
    ),
  });
}
