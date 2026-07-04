import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserPostsInput } from "../schema";

const domain_getUserPosts = async ({
  ctx,
  input
}: DomainInput<ReadUserPostsInput>) => {
  const user = await ctx.repositories.user.read(input.id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const posts = await ctx.repositories.post.readUserPosts(input.id);

  return posts;
};

export { domain_getUserPosts };
