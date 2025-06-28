import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

// Helper to detect build phase
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

// Optional override to disable Redis via env
const disableRedis = process.env.DISABLE_REDIS === "true";

const createRedisClient = () => {
  if (isBuildPhase || disableRedis) {
    // Don't create Redis client during build or when disabled
    return null;
  }

  if (!REDIS_URL) {
    throw new Error("REDIS_URL not found");
  }

  const redis = new Redis(REDIS_URL);

  redis.setMaxListeners(40);

  return redis;
};

export { createRedisClient, REDIS_URL };
