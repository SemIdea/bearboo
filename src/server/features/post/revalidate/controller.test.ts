import { describe, test, expect, vi } from "vitest";
import { revalidatePostController } from "./controller";
import { isControllerContext, TestContext } from "@/test/context";
import { revalidatePath } from "next/cache";
import { PostEntity } from "@/server/entities/post/entity";

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
});
