import { describe, expect, test } from "vitest";
import { AppError } from "../appError";
import { resolveErrorEntry } from "../index";

describe("AppError", () => {
	test("carries the code and nothing else", () => {
		const error = new AppError("media.not_found");

		expect(error.code).toBe("media.not_found");
		expect(error).toBeInstanceOf(Error);
		expect(error.name).toBe("AppError");
	});

	test("uses the code as the Error message", () => {
		// The human-readable text is resolved at the boundary, not carried here,
		// so a stack trace shows which error it was rather than its wording.
		expect(new AppError("media.not_found").message).toBe("media.not_found");
	});

	test("does not expose transport or policy metadata on the instance", () => {
		const error = new AppError("media.not_found") as unknown as Record<
			string,
			unknown
		>;

		// These moved to the registry and the transport table. Reading them off
		// the instance is what let createContext branch on a tRPC code.
		expect(error.httpCode).toBeUndefined();
		expect(error.retryable).toBeUndefined();
		expect(error.level).toBeUndefined();
	});

	test("its code resolves the metadata the catalog declares", () => {
		expect(resolveErrorEntry(new AppError("post.not_found").code)).toEqual({
			message: "Post not found.",
			retryable: false,
			level: "info",
		});
	});
});
