import { describe, expect, test } from "vitest";
import { updatePostController } from "./controller";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";
import { TRPCError } from "@trpc/server";
import { PostErrorCode } from "@/shared/error/post";

describe("Update Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should update a post successfully", async () => {
    const id = ctx.helpers.uid.generate();
    const post = await PostEntity.create({
      id,
      data: {
        title: "Original Title",
        content: "Original Content",
        userId: ctx.user!.id
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      }
    });

    const result = await updatePostController({
      ctx,
      input: {
        id,
        content: "Updated Content",
        title: "Updated Title"
      }
    });

    expect(result).toEqual({
      ...post,
      content: "Updated Content",
      title: "Updated Title",
      updatedAt: result.updatedAt
    });
  });

  test("Should throw error if post does not exist", async () => {
    const input = {
      id: "non-existent-id",
      content: "Updated Content",
      title: "Updated Title"
    };

    await expect(
      updatePostController({
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

  test("Should throw error if user tries to update a post they do not own", async () => {
    const otherUser = await ctx.createNewUser();

    const id = ctx.helpers.uid.generate();
    await PostEntity.create({
      id,
      data: {
        title: "Title",
        content: "Content",
        userId: otherUser.id
      },
      repositories: {
        ...ctx.repositories,
        database: ctx.repositories.post
      }
    });

    const input = {
      id,
      content: "Updated Content",
      title: "Updated Title"
    };

    await expect(
      updatePostController({
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
