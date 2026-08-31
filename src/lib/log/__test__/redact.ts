import { describe, expect, test } from "vitest";
import { scrub } from "../redact";
import type { LogFields } from "../types";

describe("scrub", () => {
	test("drops a field whose key names a secret", () => {
		// The realistic mistake: a dev logs the token under its own name.
		const out = scrub({ path: "user.login", refreshToken: "abc", ok: true });

		expect(out).toEqual({ path: "user.login", ok: true });
	});

	test("keeps ordinary scalar fields", () => {
		const out = scrub({ durationMs: 12, userId: "u1", retryable: false });

		expect(out).toEqual({ durationMs: 12, userId: "u1", retryable: false });
	});

	test("drops a whole object cast past the type (no input/ctx dump)", () => {
		const dirty = {
			path: "x",
			user: { email: "a@b.com", password: "p" },
		} as unknown as LogFields;

		expect(scrub(dirty)).toEqual({ path: "x" });
	});

	test("masks a credential shape under an innocent key", () => {
		const out = scrub({
			detail: "authorized with eyJhbGciOi.eyJzdWIiOiJ123 today",
		});

		expect(out.detail).toContain("[redacted]");
		expect(out.detail).not.toContain("eyJhbGciOi");
		expect(out.detail).toContain("today");
	});

	test("leaves ordinary prose that resembles a prefix untouched", () => {
		const out = scrub({ note: "the task-force shipped sketches" });

		expect(out.note).toBe("the task-force shipped sketches");
	});
});
