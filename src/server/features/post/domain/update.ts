import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { UpdatePostInput } from "../schema";

type Input = DomainInput<UpdatePostInput & { userId: string }>;

const UpdatePostService = async ({ ctx, ...data }: Input) => {
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
      message: PostErrorCode.POST_UPDATE_FORBIDDEN
    });
  }

  return await ctx.repositories.post.update(data.id, {
    title: data.title,
    content: data.content
  });
};

export { UpdatePostService };
