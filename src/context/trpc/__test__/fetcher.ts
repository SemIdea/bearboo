import { describe, expect, test } from "vitest";
import { extractSessionErrorCode } from "../fetcher";

describe("extractSessionErrorCode", () => {
	test("reads the error code from a batched tRPC error response", () => {
		const body = [
			{
				error: {
					json: {
						message: "SESSION_EXPIRED",
						code: -32001,
						data: { code: "UNAUTHORIZED", httpStatus: 401 },
					},
				},
			},
		];

		expect(extractSessionErrorCode(body)).toBe("SESSION_EXPIRED");
	});

	test("returns null when no entry in the batch has an error", () => {
		const body = [{ result: { data: { json: {} } } }] as unknown as Array<{
			error?: { json?: { message?: string } };
		}>;

		expect(extractSessionErrorCode(body)).toBeNull();
	});

	test("finds the error entry even when it isn't the first item in the batch", () => {
		const body = [
			{},
			{ error: { json: { message: "INVALID_TOKEN" } } },
		] as unknown as Array<{
			error?: { json?: { message?: string } };
		}>;

		expect(extractSessionErrorCode(body)).toBe("INVALID_TOKEN");
	});

	test("returns null when the error entry has no message", () => {
		const body = [{ error: { json: {} } }];

		expect(extractSessionErrorCode(body)).toBeNull();
	});
});
