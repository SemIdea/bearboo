import { describe, test, expect, vi } from "vitest";
import { revalidatePostController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { revalidatePath } from "next/cache";
import { PostEntity } from "@/server/entities/post/entity";
import { TRPCError } from "@trpc/server";
import { PostErrorCode } from "@/shared/error/post";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

describe("Revalidate Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();
  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User is not authenticated");
  }

  test("Should revalidate a post successfully", async () => {
    const user = ctx.user;
    const postId = ctx.helpers.uid.generate();

    const post = await PostEntity.create({
      id: postId,
      data: {
        userId: user.id,
        title: "Test Post",
        content: "This is a test post content."
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      }
    });

    const result = await revalidatePostController({
      ctx,
      input: { id: post.id }
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(post.id);
    expect(result.userId).toBe(ctx.user.id);

    expect(revalidatePath).toHaveBeenCalledWith(`/post/${post.id}`);
  });

  test("Should throw an error if post does not exist", async () => {
    const input = {
      id: "non-existent-post-id"
    };

    await expect(
      revalidatePostController({
        ctx,
        input
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "NOT_FOUND",
        message: PostErrorCode.POST_NOT_FOUND
      })
    );
  });

  test("Should throw an error if user is not the owner of the post", async () => {
    const otherUser = await ctx.createNewUser();

    const postId = ctx.helpers.uid.generate();
    await PostEntity.create({
      id: postId,
      data: {
        userId: otherUser.id,
        title: "Another User's Post",
        content: "This post belongs to another user."
      },
      repositories: { ...ctx.repositories, database: ctx.repositories.post }
    });

    const input = {
      id: postId
    };

    await expect(
      revalidatePostController({
        ctx,
        input
      })
    ).rejects.toThrowError(
      new TRPCError({
        code: "FORBIDDEN",
        message: PostErrorCode.POST_UPDATE_FORBIDDEN
      })
    );
  });
});
