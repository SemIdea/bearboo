import { Redis } from "ioredis";
import { ICacheRepositoryAdapter } from "../adapter";
import { createRedisClient } from "@/server/drivers/redis";

class RedisCacheRepository implements ICacheRepositoryAdapter {
  redisClient: Redis | null;

  constructor() {
    this.redisClient = createRedisClient();
  }

  async set(key: string, value: string, ex?: number): Promise<boolean> {
    if (!this.redisClient) return false;

    let result: string | null;
    if (ex) {
      result = await this.redisClient.set(key, value, "EX", ex);
    } else {
      result = await this.redisClient.set(key, value);
    }
    return result === "OK";
  }

  async get(key: string): Promise<string | null> {
    if (!this.redisClient) return null;
    return await this.redisClient.get(key);
  }

  async del(keys: string | string[]): Promise<boolean> {
    if (!this.redisClient) return false;

    let result: number;
    if (Array.isArray(keys)) {
      result = await this.redisClient.del(...keys);
    } else {
      result = await this.redisClient.del(keys);
    }
    return result > 0;
  }

  async bulkGet(keys: string[]): Promise<string[]> {
    if (!this.redisClient) return keys.map(() => "");
    const values = await this.redisClient.mget(keys);
    return values.map((v) => v ?? "");
  }

  async bulkSet(
    values: { key: string; value: string; ttl?: number }[]
  ): Promise<boolean> {
    if (!this.redisClient) return false;

    const multi = this.redisClient.multi();
    values.forEach(({ key, value, ttl }) => {
      if (ttl) {
        multi.set(key, value, "EX", ttl);
      } else {
        multi.set(key, value);
      }
    });

    const results = await multi.exec();
    return results ? results.every(([err]) => !err) : false;
  }

  async bulkDel(keys: string[]): Promise<boolean> {
    if (!this.redisClient) return false;

    const result = await this.redisClient.del(...keys);
    return result > 0;
  }
}

export { RedisCacheRepository };
