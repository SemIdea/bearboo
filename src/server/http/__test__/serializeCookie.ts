import { describe, expect, test } from "vitest";
import { serializeCookie } from "../serializeCookie";

describe("serializeCookie Unitary Testing", () => {
	test("Should always include HttpOnly, Path=/ and SameSite=Lax", () => {
		const header = serializeCookie(
			{ name: "accessToken", value: "abc" },
			{ secure: false },
		);

		expect(header).toContain("accessToken=abc");
		expect(header).toContain("Path=/");
		expect(header).toContain("HttpOnly");
		expect(header).toContain("SameSite=Lax");
	});

	test("Should include Secure only when opts.secure is true", () => {
		const insecure = serializeCookie(
			{ name: "accessToken", value: "abc" },
			{ secure: false },
		);
		const secure = serializeCookie(
			{ name: "accessToken", value: "abc" },
			{ secure: true },
		);

		expect(insecure).not.toContain("Secure");
		expect(secure).toContain("Secure");
	});

	test("Should include Max-Age when provided", () => {
		const header = serializeCookie(
			{ name: "accessToken", value: "abc", maxAgeSeconds: 1800 },
			{ secure: false },
		);

		expect(header).toContain("Max-Age=1800");
	});

	test("Should include Expires when provided (clear-cookie case)", () => {
		const header = serializeCookie(
			{ name: "accessToken", value: "", expires: new Date(0) },
			{ secure: false },
		);

		expect(header).toContain("accessToken=");
		expect(header).toContain("Expires=");
	});
});
