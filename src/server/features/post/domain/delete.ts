import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { DeletePostInput } from "../schema";

type Input = DomainInput<DeletePostInput & { userId: string }>;

const DeletePostService = async ({ ctx, ...data }: Input) => {
  const post = await ctx.repositories.post.read(data.id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: PostErrorCode.POST_DELETE_FORBIDDEN
    });
  }

  const deletedPost = await ctx.repositories.post.delete(post.id);

  return deletedPost;
};

export { DeletePostService };
