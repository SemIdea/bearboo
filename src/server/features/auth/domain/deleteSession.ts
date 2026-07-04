import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

const domain_deleteSession = async ({
  ctx,
  input
}: DomainInput<{ id: string; userId: string }>) => {
  const user = await ctx.repositories.user.read(input.userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const session = await ctx.repositories.session.read(input.id);

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.SESSION_NOT_FOUND
    });
  }

  await ctx.repositories.session.delete(session.id);
};

export { domain_deleteSession };
