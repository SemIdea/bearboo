import { describe, expect, test } from "vitest";
import { InMemoryViewCounterGateway } from "../inMemory";

const EVENT = { referrerBucket: "DIRECT" as const, userAgent: "test-agent" };

describe("InMemoryViewCounterGateway", () => {
	test("counts a new visitor once, dedups a repeat visitor", async () => {
		const gateway = new InMemoryViewCounterGateway();

		const first = await gateway.recordView("post-1", "visitor-1", EVENT);
		const second = await gateway.recordView("post-1", "visitor-1", EVENT);

		expect(first).toEqual({ counted: true });
		expect(second).toEqual({ counted: false });
	});

	test("counts distinct visitors separately", async () => {
		const gateway = new InMemoryViewCounterGateway();

		await gateway.recordView("post-1", "visitor-1", EVENT);
		await gateway.recordView("post-1", "visitor-2", EVENT);

		const deltas = await gateway.drainPendingCounts();

		expect(deltas).toEqual({ "post-1": 2 });
	});

	test("drainPendingCounts resets the buffer", async () => {
		const gateway = new InMemoryViewCounterGateway();
		await gateway.recordView("post-1", "visitor-1", EVENT);

		await gateway.drainPendingCounts();
		const deltas = await gateway.drainPendingCounts();

		expect(deltas).toEqual({});
	});

	test("buffers the event only for a newly-counted view", async () => {
		const gateway = new InMemoryViewCounterGateway();

		await gateway.recordView("post-1", "visitor-1", {
			referrerBucket: "SEARCH",
			userAgent: "agent-a",
		});
		await gateway.recordView("post-1", "visitor-1", {
			referrerBucket: "SOCIAL",
			userAgent: "agent-b",
		});
		await gateway.recordView("post-1", "visitor-2", {
			referrerBucket: "OTHER",
			userAgent: "agent-c",
		});

		const events = await gateway.drainPendingEvents();

		expect(events).toEqual({
			"post-1": [
				{ referrerBucket: "SEARCH", userAgent: "agent-a" },
				{ referrerBucket: "OTHER", userAgent: "agent-c" },
			],
		});
	});

	test("drainPendingEvents resets the buffer", async () => {
		const gateway = new InMemoryViewCounterGateway();
		await gateway.recordView("post-1", "visitor-1", EVENT);

		await gateway.drainPendingEvents();
		const events = await gateway.drainPendingEvents();

		expect(events).toEqual({});
	});
});
