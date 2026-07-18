import Redis from "ioredis";
import { IViewCounterGatewayAdapter, IViewEvent } from "../adapter";

const DEDUP_TTL_SECONDS = 86400;
const KEY_PREFIX = "viewcounter";

class RedisViewCounterGateway implements IViewCounterGatewayAdapter {
	private readonly redis: Redis;

	constructor(redisUrl: string) {
		this.redis = new Redis(redisUrl);
	}

	async recordView(postId: string, visitorId: string, event: IViewEvent) {
		const dateKey = new Date().toISOString().slice(0, 10);
		const visitorsKey = `${KEY_PREFIX}:${postId}:visitors:${dateKey}`;
		const pendingKey = `${KEY_PREFIX}:${postId}:pending`;
		const eventsKey = `${KEY_PREFIX}:${postId}:events`;

		const added = await this.redis.sadd(visitorsKey, visitorId);

		if (added === 0) return { counted: false };

		await this.redis.expire(visitorsKey, DEDUP_TTL_SECONDS);
		await this.redis.incr(pendingKey);
		await this.redis.rpush(eventsKey, JSON.stringify(event));

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

	async drainPendingEvents() {
		const keys = await this.redis.keys(`${KEY_PREFIX}:*:events`);
		const events: Record<string, IViewEvent[]> = {};

		for (const key of keys) {
			const rawEvents = await this.redis.lrange(key, 0, -1);
			await this.redis.del(key);

			const postId = key.slice(KEY_PREFIX.length + 1, -":events".length);
			events[postId] = rawEvents.map((raw) => JSON.parse(raw) as IViewEvent);
		}

		return events;
	}
}

export { RedisViewCounterGateway };
