import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InMemoryRateLimit } from "../implementations/inMemory";

describe("InMemoryRateLimit Unitary Testing", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("Should allow up to max consumptions within the window", async () => {
		const limiter = new InMemoryRateLimit();

		for (let i = 0; i < 3; i++) {
			const result = await limiter.consume("key", { max: 3, windowMs: 1000 });
			expect(result.allowed).toBe(true);
		}
	});

	test("Should reject the max+1 consumption within the same window", async () => {
		const limiter = new InMemoryRateLimit();

		for (let i = 0; i < 3; i++) {
			await limiter.consume("key", { max: 3, windowMs: 1000 });
		}

		const result = await limiter.consume("key", { max: 3, windowMs: 1000 });

		expect(result.allowed).toBe(false);
	});

	test("Should reset the count after the window elapses", async () => {
		const limiter = new InMemoryRateLimit();

		for (let i = 0; i < 3; i++) {
			await limiter.consume("key", { max: 3, windowMs: 1000 });
		}

		vi.advanceTimersByTime(1001);

		const result = await limiter.consume("key", { max: 3, windowMs: 1000 });

		expect(result.allowed).toBe(true);
	});

	test("Should track different keys independently", async () => {
		const limiter = new InMemoryRateLimit();

		for (let i = 0; i < 3; i++) {
			await limiter.consume("key-a", { max: 3, windowMs: 1000 });
		}

		const result = await limiter.consume("key-b", { max: 3, windowMs: 1000 });

		expect(result.allowed).toBe(true);
	});
});
