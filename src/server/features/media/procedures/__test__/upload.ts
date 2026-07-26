import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";
import { AuthErrorCode } from "@/shared/error/auth";
import {
	createAuthenticatedContext,
	createTestContext,
	IControllerContextDTO,
} from "@/test/context";
import { MediaRouter } from "../../index";

describe("Upload Media Controller Unitary Testing", () => {
	test("Should create a media record from an uploaded file", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const file = new File(["bytes"], "cover.png", { type: "image/png" });

		const result = await MediaRouter.createCaller(ctx).upload({
			file,
			altText: "cover art",
		});

		expect(result.filename).toBe("cover.png");
		expect(result.altText).toBe("cover art");
		expect(result.uploadedById).toBe(ctx.user.id);
	});

	test("Should reject an unsupported file format", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const file = new File(["bytes"], "doc.pdf", { type: "application/pdf" });

		await expect(
			MediaRouter.createCaller(ctx).upload({ file }),
		).rejects.toThrow();
	});

	test("Should throw an error when called without a session", async () => {
		const anonymousCtx = createTestContext();
		const file = new File(["bytes"], "cover.png", { type: "image/png" });

		await expect(
			MediaRouter.createCaller(anonymousCtx).upload({ file }),
		).rejects.toThrowError(
			new TRPCError({
				code: "UNAUTHORIZED",
				message: AuthErrorCode.USER_NOT_LOGGED_IN,
			}),
		);
	});
});
