import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { PostErrorCode } from "@/shared/error/post";
import { ReadPostInput } from "../schema";

type Input = DomainInput<ReadPostInput>;

const ReadPostService = async ({ ctx, id }: Input) => {
  const post = await ctx.repositories.post.read(id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  return post;
};

export { ReadPostService };
