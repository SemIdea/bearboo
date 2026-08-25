import { describe, expect, test } from "vitest";
import { scrub } from "../redact";
import type { LogFields } from "../types";

describe("scrub", () => {
	test("drops keys that name a secret", () => {
		const out = scrub({ path: "user.login", accessToken: "abc", ok: true });

		expect(out).toEqual({ path: "user.login", ok: true });
		expect("accessToken" in out).toBe(false);
	});

	test("keeps ordinary scalar fields", () => {
		const out = scrub({ durationMs: 12, userId: "u1", retryable: false });

		expect(out).toEqual({ durationMs: 12, userId: "u1", retryable: false });
	});

	test("drops a non-scalar value cast past the type", () => {
		const dirty = {
			path: "x",
			input: { password: "p" },
		} as unknown as LogFields;

		const out = scrub(dirty);

		expect(out).toEqual({ path: "x" });
	});
});
