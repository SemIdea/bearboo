import { beforeEach, describe, expect, test } from "vitest";
import { CommentRouter } from "../index";
import {
  createAuthenticatedContext,
  IControllerContextDTO
} from "@/test/context";

describe("Read All Comments Controller Unitary Testing", () => {
  let ctx: IControllerContextDTO;

  beforeEach(async () => {
    ctx = await createAuthenticatedContext();
  });

  test("Should read all comments successfully", async () => {
    const comment = await ctx.createComment();

    const result = await CommentRouter.createCaller(ctx).readAllByPost({
      postId: comment.postId
    });

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toEqual(comment.id);
    expect(result[0].content).toEqual(comment.content);
    expect(result[0].postId).toEqual(comment.postId);
    expect(result[0].userId).toEqual(ctx.user.id);
  });

  test("Should return an empty array if no comments exist for the post", async () => {
    const post = await ctx.createPost();

    const result = await CommentRouter.createCaller(ctx).readAllByPost({
      postId: post.id
    });

    expect(result).toBeDefined();
    expect(result.length).toEqual(0);
  });
});
