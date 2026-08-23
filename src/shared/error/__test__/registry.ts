import { describe, expect, test } from "vitest";
import { resolveErrorEntry } from "../index";

// The registry is where the defaults live, not the consumer. If each caller
// had to write `entry.retryable ?? false`, the boilerplate this feature is
// removing would just grow back somewhere else.
describe("resolveErrorEntry", () => {
	test("returns the metadata a catalog entry declares", () => {
		expect(resolveErrorEntry("session.session_create_error")).toEqual({
			message: "Failed to create session. Please try again.",
			retryable: true,
			level: "error",
		});
	});

	test("normalizes the optional fields to their defaults when omitted", () => {
		expect(resolveErrorEntry("media.delete_forbidden")).toEqual({
			message: "You are not allowed to delete this media.",
			retryable: false,
			level: "warn",
		});
	});

	test("applies each default independently", () => {
		// Declares `level` but not `retryable`.
		expect(resolveErrorEntry("post.not_found")).toEqual({
			message: "Post not found.",
			retryable: false,
			level: "info",
		});

		// Declares `retryable` but not `level`.
		expect(resolveErrorEntry("auth.too_many_attempts")).toEqual({
			message: "Too many attempts. Please try again later.",
			retryable: true,
			level: "warn",
		});
	});
});
