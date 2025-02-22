import { Redis } from "ioredis";
import { ICacheRepositoryAdapter } from "../adapter";
import { createRedisClient } from "@/server/drivers/redis";

class RedisCacheRepository implements ICacheRepositoryAdapter {
  redisClient: Redis;

  constructor() {
    this.redisClient = createRedisClient();
  }

  async set(key: string, value: string, ex?: number): Promise<void> {
    if (ex) {
      await this.redisClient.set(key, value, "EX", ex);
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}

export { RedisCacheRepository };
