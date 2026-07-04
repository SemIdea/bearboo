import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { SessionErrorCode } from "@/shared/error/session";
import { domain_getUserOrThrow } from "@/server/features/user/domain/getUserOrThrow";

const domain_createAuthSession = async ({
  ctx,
  input
}: DomainInput<{ userId: string }>) => {
  const user = await domain_getUserOrThrow({
    ctx,
    input: { id: input.userId }
  });

  const sessionId = ctx.helpers.uid.generate();
  const accessToken = ctx.helpers.uid.generate();
  const refreshToken = ctx.helpers.uid.generate();

  const session = await ctx.repositories.session.create(sessionId, {
    userId: user.id,
    accessToken,
    refreshToken
  });

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: SessionErrorCode.SESSION_CREATE_ERROR
    });
  }

  return session;
};

export { domain_createAuthSession };
