import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

const createRedisClient = () => {
  if (!REDIS_URL) {
    throw new Error("REDIS_URL not found");
  }

  const redis = new Redis(REDIS_URL);
  redis.setMaxListeners(40);

  return redis;
};

export { createRedisClient, REDIS_URL };
