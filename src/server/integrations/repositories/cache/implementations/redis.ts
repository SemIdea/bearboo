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

  async mget(keys: string[]): Promise<string[]> {
    const values = await this.redisClient.mget(keys);
    return values.filter((value) => value !== null) as string[];
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
}

export { RedisCacheRepository };
