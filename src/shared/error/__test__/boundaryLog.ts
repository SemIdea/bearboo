import { describe, expect, test } from "vitest";
import { createLogger } from "@/lib/log";
import { AppError } from "../appError";
import { classifyBoundaryError, depositBoundaryError } from "../boundaryLog";

describe("classifyBoundaryError", () => {
	test("classifies a AppError as recoverable with its own metadata", () => {
		const result = classifyBoundaryError(new AppError("post.not_found"));

		expect(result).toEqual({
			kind: "recoverable",
			level: "info",
			retryable: false,
			code: "post.not_found",
		});
	});

	test("unwraps a AppError carried as the cause (the boundary TRPCError case)", () => {
		const wrapped = { cause: new AppError("session.session_expired") };

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

describe("depositBoundaryError", () => {
	test("deposits the classification fields for a recoverable error", () => {
		const log = createLogger();

		depositBoundaryError(log, new AppError("post.not_found"));

		expect(log.fields).toMatchObject({
			"error.kind": "recoverable",
			"error.level": "info",
			"error.retryable": false,
			"error.code": "post.not_found",
		});
	});

	test("deposits kind=bug and a stack for an unexpected throw", () => {
		const log = createLogger();

		depositBoundaryError(log, new Error("boom"));

		expect(log.fields["error.kind"]).toBe("bug");
		expect(log.fields["error.level"]).toBe("error");
		expect(log.fields["error.code"]).toBeNull();
		expect(typeof log.fields["error.stack"]).toBe("string");
	});
});
