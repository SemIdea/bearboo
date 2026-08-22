import { describe, expect, test } from "vitest";
import { DomainError } from "../domainError";

describe("DomainError", () => {
	test("resolves httpCode and message from the registered code", () => {
		const error = new DomainError("media.not_found");

		expect(error.code).toBe("media.not_found");
		expect(error.httpCode).toBe("NOT_FOUND");
		expect(error.message).toBe("Media not found.");
		expect(error).toBeInstanceOf(Error);
	});

	test("falls back to the metadata defaults when the catalog entry omits them", () => {
		const error = new DomainError("media.not_found");

		expect(error.retryable).toBe(false);
		expect(error.level).toBe("warn");
	});
});
