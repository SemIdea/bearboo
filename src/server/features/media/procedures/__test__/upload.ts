import { describe, expect, test } from "vitest";
import {
	createAuthenticatedContext,
	createTestContext,
	IControllerContextDTO,
} from "@/test/context";
import { MediaRouter } from "../../index";

const buildFormData = (file: File, altText?: string) => {
	const formData = new FormData();
	formData.set("file", file);
	if (altText) formData.set("altText", altText);
	return formData;
};

describe("Upload Media Controller Unitary Testing", () => {
	test("Should create a media record from an uploaded file", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const file = new File(["bytes"], "cover.png", { type: "image/png" });

		const result = await MediaRouter.createCaller(ctx).upload(
			buildFormData(file, "cover art"),
		);

		expect(result.filename).toBe("cover.png");
		expect(result.altText).toBe("cover art");
		expect(result.uploadedById).toBe(ctx.user.id);
	});

	test("Should reject an unsupported file format", async () => {
		const ctx: IControllerContextDTO = await createAuthenticatedContext();
		const file = new File(["bytes"], "doc.pdf", { type: "application/pdf" });

		await expect(
			MediaRouter.createCaller(ctx).upload(buildFormData(file)),
		).rejects.toThrow();
	});

	test("Should throw an error when called without a session", async () => {
		const anonymousCtx = createTestContext();
		const file = new File(["bytes"], "cover.png", { type: "image/png" });

		await expect(
			MediaRouter.createCaller(anonymousCtx).upload(buildFormData(file)),
		).rejects.toMatchObject({
			code: "UNAUTHORIZED",
			message: "You are not logged in. Please log in to continue.",
		});
	});
});
