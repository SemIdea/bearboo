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

  async del(keys: string | string[]): Promise<void> {
    if (Array.isArray(keys)) {
      await this.redisClient.del(...keys);
    } else {
      await this.redisClient.del(keys);
    }
  }

  async mget(keys: string[]): Promise<Record<string, string | null>> {
    const values = await this.redisClient.mget(keys);
    const result: Record<string, string | null> = {};

    keys.forEach((key, i) => {
      result[key] = values[i];
    });

    return result;
  }

  async mset(keys: string[], values: string[], ex?: number): Promise<void> {
    const multi = this.redisClient.multi();

    keys.forEach((key, index) => {
      if (ex) {
        multi.set(key, values[index], "EX", ex);
      } else {
        multi.set(key, values[index]);
      }
    });
    await multi.exec();
  }

  async mdel(keys: string[]): Promise<void> {
    const multi = this.redisClient.multi();

    keys.forEach((key) => {
      multi.del(key);
    });
    await multi.exec();
  }
}

export { RedisCacheRepository };
