import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PostErrorCode } from "@/shared/error/post";
import {
	createAuthenticatedContext,
	IControllerContextDTO,
} from "@/test/context";
import { PostRouter } from "../../index";

vi.mock("next/cache", () => ({
	revalidateTag: vi.fn(),
}));

describe("Publish Post Controller Unitary Testing", () => {
	let authorCtx: IControllerContextDTO;
	let adminCtx: IControllerContextDTO;

	beforeEach(async () => {
		authorCtx = await createAuthenticatedContext();
		adminCtx = await createAuthenticatedContext({ role: "ADMIN" });
	});

	test("Should publish a draft directly, skipping review", async () => {
		const post = await authorCtx.createPost({ status: "DRAFT" });

		const result = await PostRouter.createCaller(adminCtx).publish({
			id: post.id,
		});

		expect(result.status).toEqual("PUBLISHED");
	});

	test("Should publish a post that is in review", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });

		const result = await PostRouter.createCaller(adminCtx).publish({
			id: post.id,
		});

		expect(result.status).toEqual("PUBLISHED");
	});

	test("Should schedule a post for a future date instead of publishing immediately", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });
		const scheduledAt = new Date(Date.now() + 60_000);

		const result = await PostRouter.createCaller(adminCtx).publish({
			id: post.id,
			scheduledAt,
		});

		expect(result.status).toEqual("SCHEDULED");
		expect(result.scheduledAt).toEqual(scheduledAt);
	});

	test("Should record an approval comment when provided", async () => {
		const post = await authorCtx.createPost({ status: "IN_REVIEW" });

		await PostRouter.createCaller(adminCtx).publish({
			id: post.id,
			comment: "Looks good.",
		});

		const comments = await PostRouter.createCaller(adminCtx).readReviewComments(
			{ postId: post.id },
		);

		expect(comments).toHaveLength(1);
		expect(comments[0]).toMatchObject({
			type: "APPROVAL",
			content: "Looks good.",
		});
	});

	test("Should throw an error if the caller is an Author", async () => {
		const post = await authorCtx.createPost({ status: "DRAFT" });

		await expect(
			PostRouter.createCaller(authorCtx).publish({ id: post.id }),
		).rejects.toThrowError(
			new TRPCError({
				code: "FORBIDDEN",
				message: PostErrorCode.POST_UPDATE_FORBIDDEN,
			}),
		);
	});

	test("Should throw an error if the post is already published", async () => {
		const post = await authorCtx.createPost({ status: "PUBLISHED" });

		await expect(
			PostRouter.createCaller(adminCtx).publish({ id: post.id }),
		).rejects.toThrowError(
			new TRPCError({
				code: "BAD_REQUEST",
				message: PostErrorCode.POST_INVALID_STATUS_TRANSITION,
			}),
		);
	});
});
