import Redis from "ioredis";
import { IViewCounterGatewayAdapter } from "../adapter";

const DEDUP_TTL_SECONDS = 86400;
const KEY_PREFIX = "viewcounter";

class RedisViewCounterGateway implements IViewCounterGatewayAdapter {
	private readonly redis: Redis;

	constructor(redisUrl: string) {
		this.redis = new Redis(redisUrl);
	}

	async recordView(postId: string, visitorId: string) {
		const dateKey = new Date().toISOString().slice(0, 10);
		const visitorsKey = `${KEY_PREFIX}:${postId}:visitors:${dateKey}`;
		const pendingKey = `${KEY_PREFIX}:${postId}:pending`;

		const added = await this.redis.sadd(visitorsKey, visitorId);

		if (added === 0) return { counted: false };

		await this.redis.expire(visitorsKey, DEDUP_TTL_SECONDS);
		await this.redis.incr(pendingKey);

		return { counted: true };
	}

	async drainPendingCounts() {
		const keys = await this.redis.keys(`${KEY_PREFIX}:*:pending`);
		const deltas: Record<string, number> = {};

		for (const key of keys) {
			const value = await this.redis.get(key);
			await this.redis.del(key);

			const postId = key.slice(KEY_PREFIX.length + 1, -":pending".length);
			deltas[postId] = Number(value ?? 0);
		}

		return deltas;
	}
}

export { RedisViewCounterGateway };
