import { describe, expect, test } from "vitest";
import { defineDomainErrors } from "../registry";

describe("defineDomainErrors", () => {
	test("namespaces every key with the domain prefix", () => {
		const errors = defineDomainErrors("registry_test_auth", {
			invalid_credentials: {
				httpCode: "UNAUTHORIZED",
				message: "Invalid email or password.",
			},
			user_not_verified: {
				httpCode: "FORBIDDEN",
				message: "Account not verified.",
			},
		});

		expect(errors).toEqual({
			"registry_test_auth.invalid_credentials": {
				httpCode: "UNAUTHORIZED",
				message: "Invalid email or password.",
			},
			"registry_test_auth.user_not_verified": {
				httpCode: "FORBIDDEN",
				message: "Account not verified.",
			},
		});
	});

	test("throws when the same domain is registered twice", () => {
		defineDomainErrors("registry_test_media", {
			not_found: { httpCode: "NOT_FOUND", message: "Media not found." },
		});

		expect(() =>
			defineDomainErrors("registry_test_media", {
				delete_forbidden: {
					httpCode: "FORBIDDEN",
					message: "Not allowed.",
				},
			}),
		).toThrow(/registry_test_media/);
	});
});
