import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserPostsInput } from "../schema";

type Input = DomainInput<ReadUserPostsInput>;

const GetUserPostsService = async ({ ctx, id }: Input) => {
  const user = await ctx.repositories.user.read(id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const posts = await ctx.repositories.post.readUserPosts(id);

  return posts;
};

export { GetUserPostsService };
