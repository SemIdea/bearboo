import { TRPCError } from "@trpc/server";
import { createDomain, DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { UpdatePostInput } from "../schema";

const domain_updatePost = createDomain(
  async ({
    ctx,
    input
  }: DomainInput<UpdatePostInput & { userId: string }>) => {
    const post = await ctx.repositories.post.read(input.id);

    if (!post) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: PostErrorCode.POST_NOT_FOUND
      });
    }

    if (post.userId !== input.userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: PostErrorCode.POST_UPDATE_FORBIDDEN
      });
    }

    return ctx.repositories.post.update(input.id, {
      title: input.title,
      content: input.content
    });
  }
);

export { domain_updatePost };
