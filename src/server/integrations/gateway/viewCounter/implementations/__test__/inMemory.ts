import { describe, expect, test } from "vitest";
import { InMemoryViewCounterGateway } from "../inMemory";

describe("InMemoryViewCounterGateway", () => {
	test("counts a new visitor once, dedups a repeat visitor", async () => {
		const gateway = new InMemoryViewCounterGateway();

		const first = await gateway.recordView("post-1", "visitor-1");
		const second = await gateway.recordView("post-1", "visitor-1");

		expect(first).toEqual({ counted: true });
		expect(second).toEqual({ counted: false });
	});

	test("counts distinct visitors separately", async () => {
		const gateway = new InMemoryViewCounterGateway();

		await gateway.recordView("post-1", "visitor-1");
		await gateway.recordView("post-1", "visitor-2");

		const deltas = await gateway.drainPendingCounts();

		expect(deltas).toEqual({ "post-1": 2 });
	});

	test("drainPendingCounts resets the buffer", async () => {
		const gateway = new InMemoryViewCounterGateway();
		await gateway.recordView("post-1", "visitor-1");

		await gateway.drainPendingCounts();
		const deltas = await gateway.drainPendingCounts();

		expect(deltas).toEqual({});
	});
});
