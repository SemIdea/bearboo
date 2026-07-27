import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostErrorCode, PostErrorMessages } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
}));

describe("Archive Post Controller Unitary Testing", () => {
	let authorCtx: IControllerContextDTO;
	let adminCtx: IControllerContextDTO;

	beforeEach(async () => {
		authorCtx = await createAuthenticatedContext();
		adminCtx = await createAuthenticatedContext({ role: "ADMIN" });
	});

	test("Should let an Admin archive a post owned by someone else", async () => {
		const post = await authorCtx.createPost({ status: "PUBLISHED" });

		const result = await PostRouter.createCaller(adminCtx).archive({
			id: post.id,
		});

		expect(result.status).toEqual("ARCHIVED");
	});

	test("Should throw an error if the caller is the Author and owns the post", async () => {
		const post = await authorCtx.createPost({ status: "PUBLISHED" });

		await expect(
			PostRouter.createCaller(authorCtx).archive({ id: post.id }),
		).rejects.toMatchObject({
			code: "FORBIDDEN",
			message: PostErrorMessages[PostErrorCode.POST_UPDATE_FORBIDDEN],
		});
	});

	test("Should throw an error if the post is already archived", async () => {
		const post = await authorCtx.createPost({ status: "ARCHIVED" });

		await expect(
			PostRouter.createCaller(adminCtx).archive({ id: post.id }),
		).rejects.toMatchObject({
			code: "BAD_REQUEST",
			message: PostErrorMessages[PostErrorCode.POST_INVALID_STATUS_TRANSITION],
		});
	});
});
