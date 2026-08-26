import { describe, expect, test } from "vitest";
import { AppError } from "@/shared/error/appError";
import { createTestContext } from "@/test/context";
import { domain_readUserProfile } from "../readProfile";

// The procedure short-circuits when a user reads their own profile, so this
// domain only runs for "read someone else's profile". It must expose the
// public fields and nothing sensitive (no password).
describe("domain_readUserProfile", () => {
	test("returns the public profile fields for an existing user", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();

		const profile = await domain_readUserProfile({
			ctx,
			input: { id: user.id },
		});

		expect(profile).toEqual({
			id: user.id,
			name: user.name,
			email: user.email,
			verified: user.verified,
			role: user.role,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			bio: user.bio,
		});
	});

	test("never exposes the password hash", async () => {
		const ctx = createTestContext();
		const user = await ctx.createNewUser();

		const profile = await domain_readUserProfile({
			ctx,
			input: { id: user.id },
		});

		expect("password" in profile).toBe(false);
	});

	test("throws when the user does not exist", async () => {
		const ctx = createTestContext();

		await expect(
			domain_readUserProfile({ ctx, input: { id: "missing-user" } }),
		).rejects.toMatchObject(new AppError("user.not_found"));
	});
});
