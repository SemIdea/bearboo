import { beforeEach, describe, expect, test, vi } from "vitest";
import { RedisViewCounterGateway } from "../redis";

const saddMock = vi.hoisted(() => vi.fn());
const expireMock = vi.hoisted(() => vi.fn());
const incrMock = vi.hoisted(() => vi.fn());
const keysMock = vi.hoisted(() => vi.fn());
const getMock = vi.hoisted(() => vi.fn());
const delMock = vi.hoisted(() => vi.fn());
const rpushMock = vi.hoisted(() => vi.fn());
const lrangeMock = vi.hoisted(() => vi.fn());
const redisConstructorMock = vi.hoisted(() =>
	vi.fn(function RedisMock() {
		return {
			sadd: saddMock,
			expire: expireMock,
			incr: incrMock,
			keys: keysMock,
			get: getMock,
			del: delMock,
			rpush: rpushMock,
			lrange: lrangeMock,
		};
	}),
);

vi.mock("ioredis", () => ({
	default: redisConstructorMock,
}));

const EVENT = { referrerBucket: "DIRECT" as const, userAgent: "test-agent" };

describe("RedisViewCounterGateway", () => {
	beforeEach(() => {
		saddMock.mockReset();
		expireMock.mockReset();
		incrMock.mockReset();
		keysMock.mockReset();
		getMock.mockReset();
		delMock.mockReset();
		rpushMock.mockReset();
		lrangeMock.mockReset();
	});

	test("records a new view: SADD new member, sets TTL, increments pending count, buffers the event", async () => {
		saddMock.mockResolvedValue(1);

		const gateway = new RedisViewCounterGateway("redis://localhost:6379/0");
		const result = await gateway.recordView("post-1", "visitor-1", EVENT);

		expect(saddMock).toHaveBeenCalledWith(
			expect.stringMatching(/^viewcounter:post-1:visitors:\d{4}-\d{2}-\d{2}$/),
			"visitor-1",
		);
		expect(expireMock).toHaveBeenCalledWith(
			expect.stringMatching(/^viewcounter:post-1:visitors:\d{4}-\d{2}-\d{2}$/),
			86400,
		);
		expect(incrMock).toHaveBeenCalledWith("viewcounter:post-1:pending");
		expect(rpushMock).toHaveBeenCalledWith(
			"viewcounter:post-1:events",
			JSON.stringify(EVENT),
		);
		expect(result).toEqual({ counted: true });
	});

	test("does not count a duplicate visitor: SADD returns 0, does not buffer the event", async () => {
		saddMock.mockResolvedValue(0);

		const gateway = new RedisViewCounterGateway("redis://localhost:6379/0");
		const result = await gateway.recordView("post-1", "visitor-1", EVENT);

		expect(expireMock).not.toHaveBeenCalled();
		expect(incrMock).not.toHaveBeenCalled();
		expect(rpushMock).not.toHaveBeenCalled();
		expect(result).toEqual({ counted: false });
	});

	test("drains pending counts and clears the keys", async () => {
		keysMock.mockResolvedValue([
			"viewcounter:post-1:pending",
			"viewcounter:post-2:pending",
		]);
		getMock.mockResolvedValueOnce("3").mockResolvedValueOnce("5");

		const gateway = new RedisViewCounterGateway("redis://localhost:6379/0");
		const deltas = await gateway.drainPendingCounts();

		expect(keysMock).toHaveBeenCalledWith("viewcounter:*:pending");
		expect(delMock).toHaveBeenCalledWith("viewcounter:post-1:pending");
		expect(delMock).toHaveBeenCalledWith("viewcounter:post-2:pending");
		expect(deltas).toEqual({ "post-1": 3, "post-2": 5 });
	});

	test("drains pending events, parses them and clears the keys", async () => {
		keysMock.mockResolvedValue(["viewcounter:post-1:events"]);
		lrangeMock.mockResolvedValue([
			JSON.stringify({ referrerBucket: "SEARCH", userAgent: "agent-a" }),
			JSON.stringify({ referrerBucket: "SOCIAL", userAgent: "agent-b" }),
		]);

		const gateway = new RedisViewCounterGateway("redis://localhost:6379/0");
		const events = await gateway.drainPendingEvents();

		expect(keysMock).toHaveBeenCalledWith("viewcounter:*:events");
		expect(lrangeMock).toHaveBeenCalledWith("viewcounter:post-1:events", 0, -1);
		expect(delMock).toHaveBeenCalledWith("viewcounter:post-1:events");
		expect(events).toEqual({
			"post-1": [
				{ referrerBucket: "SEARCH", userAgent: "agent-a" },
				{ referrerBucket: "SOCIAL", userAgent: "agent-b" },
			],
		});
	});
});
