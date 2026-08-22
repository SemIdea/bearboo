import { afterEach, describe, expect, test, vi } from "vitest";
import { classifyBoundaryError, logBoundaryError } from "../boundaryLog";
import { DomainError } from "../domainError";

describe("classifyBoundaryError", () => {
	test("classifies a DomainError as recoverable with its own metadata", () => {
		const result = classifyBoundaryError(new DomainError("post.not_found"));

		expect(result).toEqual({
			kind: "recoverable",
			level: "info",
			retryable: false,
			code: "post.not_found",
		});
	});

	test("unwraps a DomainError carried as the cause (the boundary TRPCError case)", () => {
		const wrapped = { cause: new DomainError("session.session_expired") };

		const result = classifyBoundaryError(wrapped);

		expect(result).toEqual({
			kind: "recoverable",
			level: "info",
			retryable: true,
			code: "session.session_expired",
		});
	});

	test("classifies any other throw as a bug logged at error level", () => {
		const result = classifyBoundaryError(new Error("unexpected null"));

		expect(result).toEqual({
			kind: "bug",
			level: "error",
			retryable: false,
			code: null,
		});
	});
});

describe("logBoundaryError", () => {
	afterEach(() => vi.restoreAllMocks());

	test("routes a recoverable info error to console.info, not console.error", () => {
		const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
		const error = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		logBoundaryError(new DomainError("post.not_found"));

		expect(info).toHaveBeenCalledTimes(1);
		expect(error).not.toHaveBeenCalled();
	});

	test("routes a bug to console.error", () => {
		const error = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);

		logBoundaryError(new Error("boom"));

		expect(error).toHaveBeenCalledTimes(1);
	});
});
