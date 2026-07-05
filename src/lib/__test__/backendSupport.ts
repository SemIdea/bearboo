import { afterEach, describe, expect, test } from "vitest";
import { featureFlags } from "@/config/featureFlags";
import { AuthErrorCode, AuthErrorMessages } from "@/shared/error/auth";
import { getBoolEnv } from "../env/getBoolEnv";
import { getIntEnv } from "../env/getIntEnv";
import { getStrEnv } from "../env/getStrEnv";
import { getErrorMessage } from "../error";
import { isFeatureEnabled } from "../featureFlags";
import { BycryptPasswordHashingHelper } from "../passwordHashing/implementations/bycrypt";
import { UuidGenerator } from "../uidGenerator/implementations/uuid";

describe("backend support helpers", () => {
	const managedEnvKeys = [
		"TEST_BOOL_ENV",
		"TEST_INT_ENV",
		"TEST_STR_ENV",
	] as const;
	const previousEnv = new Map<string, string | undefined>();

	afterEach(() => {
		for (const key of managedEnvKeys) {
			const previousValue = previousEnv.get(key);

			if (previousValue === undefined) {
				delete process.env[key];
			} else {
				process.env[key] = previousValue;
			}
		}

		previousEnv.clear();
	});

	const setEnv = (key: (typeof managedEnvKeys)[number], value?: string) => {
		previousEnv.set(key, process.env[key]);

		if (value === undefined) {
			delete process.env[key];
		} else {
			process.env[key] = value;
		}
	};

	test("reads integer env values with fallback for missing or invalid values", () => {
		setEnv("TEST_INT_ENV");
		expect(getIntEnv("TEST_INT_ENV", 3000)).toBe(3000);

		setEnv("TEST_INT_ENV", "invalid");
		expect(getIntEnv("TEST_INT_ENV", 3000)).toBe(3000);

		setEnv("TEST_INT_ENV", "587");
		expect(getIntEnv("TEST_INT_ENV", 3000)).toBe(587);
	});

	test("reads boolean env values with fallback for missing or invalid values", () => {
		setEnv("TEST_BOOL_ENV");
		expect(getBoolEnv("TEST_BOOL_ENV", true)).toBe(true);
		expect(getBoolEnv("TEST_BOOL_ENV", false)).toBe(false);

		setEnv("TEST_BOOL_ENV", "true");
		expect(getBoolEnv("TEST_BOOL_ENV", false)).toBe(true);

		setEnv("TEST_BOOL_ENV", "false");
		expect(getBoolEnv("TEST_BOOL_ENV", true)).toBe(false);

		setEnv("TEST_BOOL_ENV", "invalid");
		expect(getBoolEnv("TEST_BOOL_ENV", true)).toBe(true);
	});

	test("reads string env values with fallback only when missing", () => {
		setEnv("TEST_STR_ENV");
		expect(getStrEnv("TEST_STR_ENV", "fallback")).toBe("fallback");

		setEnv("TEST_STR_ENV", "");
		expect(getStrEnv("TEST_STR_ENV", "fallback")).toBe("");

		setEnv("TEST_STR_ENV", "configured");
		expect(getStrEnv("TEST_STR_ENV", "fallback")).toBe("configured");
	});

	test("hashes and compares passwords", async () => {
		const helper = new BycryptPasswordHashingHelper();
		const hashedPassword = await helper.hash("correct-password");

		expect(hashedPassword).not.toBe("correct-password");
		expect(await helper.compare("correct-password", hashedPassword)).toBe(true);
		expect(await helper.compare("wrong-password", hashedPassword)).toBe(false);
	});

	test("generates UUID values", () => {
		const uid = new UuidGenerator().generate();

		expect(uid).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
		);
	});

	test("resolves known and fallback error messages", () => {
		expect(getErrorMessage(AuthErrorCode.INVALID_CREDENTIALS)).toBe(
			AuthErrorMessages.INVALID_CREDENTIALS,
		);
		expect(getErrorMessage("UNKNOWN_ERROR_CODE")).toBe(
			"An unexpected error occurred. Please try again.",
		);
	});

	test("reads feature flags from the central config", () => {
		expect(isFeatureEnabled("enableComments")).toBe(
			featureFlags.enableComments,
		);
	});
});
