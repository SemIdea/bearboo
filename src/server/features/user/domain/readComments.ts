import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserCommentsInput } from "../schema";

type Input = DomainInput<ReadUserCommentsInput>;

const ReadUserCommentsService = async ({ ctx, id }: Input) => {
  const user = await ctx.repositories.user.read(id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const comments = await ctx.repositories.comment.readAllByUserId(id);

  return comments ?? [];
};

export { ReadUserCommentsService };
