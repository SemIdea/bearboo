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
});
