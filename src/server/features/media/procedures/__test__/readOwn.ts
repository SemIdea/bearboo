import { describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	createTestContext,
	IControllerContextDTO,
} from "@/test/context";
import { MediaRouter } from "../../index";

describe("Read Own Media Controller Unitary Testing", () => {
	test("Should never include another user's media for an author", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const otherUser = await ctx.createNewUser();
		const formData = new FormData();
		formData.set(
			"file",
			new File(["bytes"], "mine.png", { type: "image/png" }),
		);
		await MediaRouter.createCaller(ctx).upload(formData);
		await ctx.repositories.media.create(ctx.helpers.uid.generate(), {
			url: "/uploads/theirs.png",
			storageKey: "theirs.png",
			filename: "theirs.png",
			mimeType: "image/png",
			size: 5,
			altText: null,
			uploadedById: otherUser.id,
		});

		const result = await MediaRouter.createCaller(ctx).readOwn();

		expect(result).toHaveLength(1);
		expect(result[0].filename).toBe("mine.png");
	});

	test("Should throw an error when called without a session", async () => {
		const anonymousCtx = createTestContext();

		await expect(
			MediaRouter.createCaller(anonymousCtx).readOwn(),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: "You are not logged in. Please log in to continue.",
		});
	});
});
