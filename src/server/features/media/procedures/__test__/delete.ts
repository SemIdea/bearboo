import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import { MediaErrorCode, MediaErrorMessages } from "@/shared/error/media";
import {
	createAuthenticatedContext,
	createTestContext,
	IControllerContextDTO,
} from "@/test/context";
import { MediaRouter } from "../../index";

describe("Delete Media Controller Unitary Testing", () => {
	test("Should let the owner delete their own media", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const media = await MediaRouter.createCaller(ctx).upload({
			file: new File(["bytes"], "mine.png", { type: "image/png" }),
		});

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
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: MediaErrorMessages[MediaErrorCode.MEDIA_DELETE_FORBIDDEN],
			}),
		);
	});

	test("Should throw NOT_FOUND for a nonexistent media", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();

		await expect(
			MediaRouter.createCaller(ctx).delete({ id: "does-not-exist" }),
		).rejects.toThrowError(
			new TRPCError({
				code: "NOT_FOUND",
				message: MediaErrorMessages[MediaErrorCode.MEDIA_NOT_FOUND],
			}),
		);
	});

	test("Should throw an error when called without a session", async () => {
		const anonymousCtx = createTestContext();

		await expect(
			MediaRouter.createCaller(anonymousCtx).delete({ id: "any" }),
		).rejects.toThrowError(
			new TRPCError({
				code: "UNAUTHORIZED",
				message: AuthErrorCode.USER_NOT_LOGGED_IN,
			}),
		);
	});
});
