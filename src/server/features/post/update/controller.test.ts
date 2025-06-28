import { describe, expect, test } from "vitest";
import { updatePostController } from "./controller";
import { PostEntity } from "@/server/entities/post/entity";
import { isControllerContext, TestContext } from "@/test/context";

describe("Update Post Controller Unitary Testing", async () => {
  const ctx = new TestContext();

  await ctx.createAuthenticatedUser();

  if (!isControllerContext(ctx)) {
    throw new Error("User not authenticated");
  }

  test("Should update a post successfully", async () => {
    const id = ctx.generateSnowflakeUuid();
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
      title: "Updated Title"
    });
  });
});
