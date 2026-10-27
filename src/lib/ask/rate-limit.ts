import { createHash } from "node:crypto";

const MINUTE_LIMIT = 2;
const DAY_LIMIT = 20;
const GLOBAL_MINUTE_LIMIT = 2;
const DEFAULT_GLOBAL_DAILY_LIMIT = 40;
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

type Bucket = {
  count: number;
  resetAt: number;
};

type MemoryHit = {
  count: number;
  remaining: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  headers: Record<string, string>;
  reason?: "minute" | "day" | "global" | "global-minute";
};

const memoryBuckets = new Map<string, Bucket>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 24);
}

function globalDailyLimit(): number {
  const parsed = Number(process.env.ASK_DAILY_LIMIT);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : DEFAULT_GLOBAL_DAILY_LIMIT;
}

function rateLimitHeaders(
  remaining: number,
  resetAt: number,
  allowed: boolean,
): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(MINUTE_LIMIT),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
  };

  if (!allowed) {
    headers["Retry-After"] = String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)));
  }

  return headers;
}

function hitMemory(key: string, limit: number, windowMs: number, now: number): MemoryHit {
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + windowMs };
    memoryBuckets.set(key, bucket);
    return {
      count: bucket.count,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  existing.count += 1;
  return {
    count: existing.count,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

function checkMemory(ipKey: string): RateLimitResult {
  const now = Date.now();
  const limit = globalDailyLimit();
  const minuteKey = `${ipKey}:minute:${Math.floor(now / MINUTE_MS)}`;
  const dayKey = `${ipKey}:day:${Math.floor(now / DAY_MS)}`;
  const globalMinuteKey = `global-minute:${Math.floor(now / MINUTE_MS)}`;
  const globalKey = `global:${Math.floor(now / DAY_MS)}`;

  const minute = hitMemory(minuteKey, MINUTE_LIMIT, MINUTE_MS, now);
  const day = hitMemory(dayKey, DAY_LIMIT, DAY_MS, now);
  const globalMinute = hitMemory(globalMinuteKey, GLOBAL_MINUTE_LIMIT, MINUTE_MS, now);
  const global = hitMemory(globalKey, limit, DAY_MS, now);

  const reason =
    global.count > limit
      ? "global"
      : globalMinute.count > GLOBAL_MINUTE_LIMIT
        ? "global-minute"
        : day.count > DAY_LIMIT
          ? "day"
          : minute.count > MINUTE_LIMIT
            ? "minute"
            : undefined;

  const resetAt =
    reason === "global"
      ? global.resetAt
      : reason === "global-minute"
        ? globalMinute.resetAt
        : reason === "day"
          ? day.resetAt
          : minute.resetAt;
  const remaining = Math.min(
    minute.remaining,
    day.remaining,
    globalMinute.remaining,
    global.remaining,
  );

  if (memoryBuckets.size > 2_000) {
    for (const [key, bucket] of memoryBuckets) {
      if (bucket.resetAt <= now) memoryBuckets.delete(key);
    }
  }

  return {
    allowed: reason === undefined,
    reason,
    headers: rateLimitHeaders(remaining, resetAt, reason === undefined),
  };
}

async function checkUpstash(ipKey: string): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    throw new Error("Upstash is not configured");
  }

  const now = Date.now();
  const limit = globalDailyLimit();
  const minuteWindow = Math.floor(now / MINUTE_MS);
  const dayWindow = Math.floor(now / DAY_MS);
  const minuteKey = `ask:minute:${ipKey}:${minuteWindow}`;
  const dayKey = `ask:day:${ipKey}:${dayWindow}`;
  const globalMinuteKey = `ask:global-minute:${minuteWindow}`;
  const globalKey = `ask:global:${dayWindow}`;

  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", minuteKey],
      ["EXPIRE", minuteKey, 120],
      ["INCR", dayKey],
      ["EXPIRE", dayKey, 90_000],
      ["INCR", globalMinuteKey],
      ["EXPIRE", globalMinuteKey, 120],
      ["INCR", globalKey],
      ["EXPIRE", globalKey, 90_000],
    ]),
    cache: "no-store",
    signal: AbortSignal.timeout(1_500),
  });

  if (!response.ok) {
    throw new Error(`Upstash returned ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Upstash returned an invalid payload");
  }

  const counts = payload.map((entry) =>
    isRecord(entry) && typeof entry.result === "number" ? entry.result : null,
  );
  const minuteCount = counts[0];
  const dayCount = counts[2];
  const globalMinuteCount = counts[4];
  const globalCount = counts[6];
  if (
    minuteCount === null ||
    dayCount === null ||
    globalMinuteCount === null ||
    globalCount === null
  ) {
    throw new Error("Upstash did not return all rate-limit counts");
  }

  const reason =
    globalCount > limit
      ? "global"
      : globalMinuteCount > GLOBAL_MINUTE_LIMIT
        ? "global-minute"
        : dayCount > DAY_LIMIT
          ? "day"
          : minuteCount > MINUTE_LIMIT
            ? "minute"
            : undefined;
  const resetAt =
    reason === "minute" || reason === "global-minute"
      ? (minuteWindow + 1) * MINUTE_MS
      : (dayWindow + 1) * DAY_MS;
  const remaining = Math.min(
    MINUTE_LIMIT - minuteCount,
    DAY_LIMIT - dayCount,
    GLOBAL_MINUTE_LIMIT - globalMinuteCount,
    limit - globalCount,
  );

  return {
    allowed: reason === undefined,
    reason,
    headers: rateLimitHeaders(remaining, resetAt, reason === undefined),
  };
}

export async function checkAskRateLimit(request: Request): Promise<RateLimitResult> {
  const ipKey = hashIp(getClientIp(request));

  if (process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim()) {
    try {
      return await checkUpstash(ipKey);
    } catch (error) {
      console.error(
        "[ask] Upstash rate limit failed; using in-memory fallback",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return checkMemory(ipKey);
}
