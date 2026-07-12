import { describe, expect, test } from "vitest";
import { CookieJar } from "../cookieJar";

describe("CookieJar Unitary Testing", () => {
	test("Should queue a set() call as a pending cookie", () => {
		const jar = new CookieJar();

		jar.set("accessToken", "abc", { maxAgeSeconds: 1800 });

		expect(jar.pending).toEqual([
			{ name: "accessToken", value: "abc", maxAgeSeconds: 1800 },
		]);
	});

	test("Should queue a clear() call as an expired empty-value cookie", () => {
		const jar = new CookieJar();

		jar.clear("accessToken");

		expect(jar.pending).toHaveLength(1);
		expect(jar.pending[0]?.name).toBe("accessToken");
		expect(jar.pending[0]?.value).toBe("");
		expect(jar.pending[0]?.expires?.getTime()).toBe(0);
	});

	test("Should accumulate multiple cookies in order", () => {
		const jar = new CookieJar();

		jar.set("accessToken", "abc");
		jar.set("refreshToken", "def");

		expect(jar.pending.map((c) => c.name)).toEqual([
			"accessToken",
			"refreshToken",
		]);
	});
});
