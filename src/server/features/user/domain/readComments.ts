import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserCommentsInput } from "../schema";

const domain_readUserComments = async ({
  ctx,
  input
}: DomainInput<ReadUserCommentsInput>) => {
  const user = await ctx.repositories.user.read(input.id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const comments = await ctx.repositories.comment.readAllByUserId(input.id);

  return comments ?? [];
};

export { domain_readUserComments };
