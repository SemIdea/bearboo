import { afterEach, describe, expect, test, vi } from "vitest";
import { createLogger, emit } from "../logger";
import type { EmitMeta } from "../types";

const meta: EmitMeta = {
	level: "info",
	ok: true,
	path: "user.login",
	durationMs: 3,
};

describe("createLogger", () => {
	test("accumulates added fields over the base", () => {
		const log = createLogger({ visitorId: "v1" });

		log.add({ step: "one" });
		log.add({ count: 2 });

		expect(log.fields).toEqual({ visitorId: "v1", step: "one", count: 2 });
	});
});

describe("emit", () => {
	afterEach(() => vi.restoreAllMocks());

	test("writes exactly one line to stdout", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const log = createLogger();

		log.add({ userId: "u1" });
		emit(log, meta, "production");

		expect(spy).toHaveBeenCalledTimes(1);
	});

	test("a sensitive key never reaches the sink", () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
		const log = createLogger();

		log.add({ accessToken: "sk-secret-value" });
		emit(log, meta, "production");

		const line = spy.mock.calls[0]?.[0] as string;

		expect(line).not.toContain("accessToken");
		expect(line).not.toContain("sk-secret-value");
	});
});
