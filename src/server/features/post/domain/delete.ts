import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { DeletePostInput } from "../schema";

const domain_deletePost = async ({
  ctx,
  input
}: DomainInput<DeletePostInput & { userId: string }>) => {
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
      message: PostErrorCode.POST_DELETE_FORBIDDEN
    });
  }

  return ctx.repositories.post.delete(post.id);
};

export { domain_deletePost };
