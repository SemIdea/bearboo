import { describe, expect, test } from "vitest";
import { type ErrorCode, Errors } from "@/shared/error";
import { domainErrorTransport } from "../domainErrorTransport";

// TEMPORARY parity net (feature 024, T001 → deleted in T012).
//
// The transport table is transcribed by hand from the catalogs. While both
// sources coexist, these tests make a transcription slip a build failure
// instead of a silently wrong status code on the wire. Once `httpCode` is
// removed from the catalogs, there is nothing left to compare and this file
// goes away — the `Record<ErrorCode, ...>` type becomes the only guarantee
// needed (totality), which the compiler checks on its own.
describe("domainErrorTransport (parity with the catalogs)", () => {
	test("covers exactly the registered error codes, no more and no less", () => {
		expect(Object.keys(domainErrorTransport).sort()).toEqual(
			Object.keys(Errors).sort(),
		);
	});

	test("preserves the httpCode each catalog entry declares today", () => {
		for (const [code, entry] of Object.entries(Errors)) {
			expect(domainErrorTransport[code as ErrorCode]).toBe(entry.httpCode);
		}
	});
});
