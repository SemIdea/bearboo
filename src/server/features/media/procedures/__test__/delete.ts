import { describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	createTestContext,
	IControllerContextDTO,
} from "@/test/context";
import { MediaRouter } from "../../index";

describe("Delete Media Controller Unitary Testing", () => {
	test("Should let the owner delete their own media", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const formData = new FormData();
		formData.set(
			"file",
			new File(["bytes"], "mine.png", { type: "image/png" }),
		);
		const media = await MediaRouter.createCaller(ctx).upload(formData);

		const result = await MediaRouter.createCaller(ctx).delete({
			id: media.id,
		});

		expect(result).toEqual({ success: true });
	});

	test("Should reject deleting another user's media without bypass", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const otherUser = await ctx.createNewUser();
		await ctx.repositories.media.create(ctx.helpers.uid.generate(), {
			url: "/uploads/theirs.png",
			storageKey: "theirs.png",
			filename: "theirs.png",
			mimeType: "image/png",
			size: 5,
			altText: null,
			uploadedById: otherUser.id,
		});
		const theirs = (await ctx.repositories.media.readByUser(otherUser.id))[0];

		await expect(
			MediaRouter.createCaller(ctx).delete({ id: theirs.id }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: "You are not allowed to delete this media.",
		});
	});

	test("Should throw NOT_FOUND for a nonexistent media", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();

		await expect(
			MediaRouter.createCaller(ctx).delete({ id: "does-not-exist" }),
		).rejects.toMatchObject({
			code: "NOT_FOUND",
			message: "Media not found.",
		});
	});

	test("Should throw an error when called without a session", async () => {
		const anonymousCtx = createTestContext();

		await expect(
			MediaRouter.createCaller(anonymousCtx).delete({ id: "any" }),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: "You are not logged in. Please log in to continue.",
		});
	});
});
