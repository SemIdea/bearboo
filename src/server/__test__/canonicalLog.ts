import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";
import { AppError } from "@/shared/error/appError";
import { createTestContext } from "@/test/context";
import { publicProcedure, t } from "../createRouter";

const logRouter = t.router({
	ok: publicProcedure.input(z.string().optional()).query(({ ctx, input }) => {
		if (input) ctx.log.add({ marker: input });
		return "ok";
	}),
	boom: publicProcedure.query(() => {
		throw new AppError("post.not_found");
	}),
});

describe("canonical log line", () => {
	afterEach(() => vi.restoreAllMocks());

	test("emits one line with the path, a duration and ok=true on success", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const ctx = createTestContext();

		await logRouter.createCaller(ctx).ok();

		expect(spy).toHaveBeenCalledTimes(1);
		const line = spy.mock.calls[0]?.[0] as string;
		expect(line).toContain("ok=true");
		expect(line).toMatch(/\d+ms/);
	});

	test("carries the error classification on failure", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const ctx = createTestContext();

		await expect(logRouter.createCaller(ctx).boom()).rejects.toBeDefined();

		const line = spy.mock.calls[0]?.[0] as string;
		expect(line).toContain("ok=false");
		expect(line).toContain("error.code=post.not_found");
		expect(line).toContain("error.kind=recoverable");
	});

	test("does not share accumulated fields between calls", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const caller = logRouter.createCaller(createTestContext());

		await caller.ok("A");
		await caller.ok("B");

		const lineA = spy.mock.calls[0]?.[0] as string;
		const lineB = spy.mock.calls[1]?.[0] as string;
		expect(lineA).toContain("marker=A");
		expect(lineA).not.toContain("marker=B");
		expect(lineB).toContain("marker=B");
		expect(lineB).not.toContain("marker=A");
	});
});
