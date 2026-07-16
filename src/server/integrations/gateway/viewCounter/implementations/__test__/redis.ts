import { beforeEach, describe, expect, test, vi } from "vitest";
import { RedisViewCounterGateway } from "../redis";

const saddMock = vi.hoisted(() => vi.fn());
const expireMock = vi.hoisted(() => vi.fn());
const incrMock = vi.hoisted(() => vi.fn());
const keysMock = vi.hoisted(() => vi.fn());
const getMock = vi.hoisted(() => vi.fn());
const delMock = vi.hoisted(() => vi.fn());
const redisConstructorMock = vi.hoisted(() =>
	vi.fn(function RedisMock() {
		return {
			sadd: saddMock,
			expire: expireMock,
			incr: incrMock,
			keys: keysMock,
			get: getMock,
			del: delMock,
		};
	}),
);

vi.mock("ioredis", () => ({
	default: redisConstructorMock,
}));

describe("RedisViewCounterGateway", () => {
	beforeEach(() => {
		saddMock.mockReset();
		expireMock.mockReset();
		incrMock.mockReset();
		keysMock.mockReset();
		getMock.mockReset();
		delMock.mockReset();
	});

	test("records a new view: SADD new member, sets TTL, increments pending count", async () => {
		saddMock.mockResolvedValue(1);

		const gateway = new RedisViewCounterGateway("redis://localhost:6379/0");
		const result = await gateway.recordView("post-1", "visitor-1");

		expect(saddMock).toHaveBeenCalledWith(
			expect.stringMatching(/^viewcounter:post-1:visitors:\d{4}-\d{2}-\d{2}$/),
			"visitor-1",
		);
		expect(expireMock).toHaveBeenCalledWith(
			expect.stringMatching(/^viewcounter:post-1:visitors:\d{4}-\d{2}-\d{2}$/),
			86400,
		);
		expect(incrMock).toHaveBeenCalledWith("viewcounter:post-1:pending");
		expect(result).toEqual({ counted: true });
	});

	test("does not count a duplicate visitor: SADD returns 0", async () => {
		saddMock.mockResolvedValue(0);

		const gateway = new RedisViewCounterGateway("redis://localhost:6379/0");
		const result = await gateway.recordView("post-1", "visitor-1");

		expect(expireMock).not.toHaveBeenCalled();
		expect(incrMock).not.toHaveBeenCalled();
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
});
