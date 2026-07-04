import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { SessionErrorCode } from "@/shared/error/session";
import { RefreshSessionInput } from "../schema";

const domain_readSessionByRefreshToken = async ({
  ctx,
  input
}: DomainInput<RefreshSessionInput>) => {
  const session = await ctx.repositories.session.readByRefreshToken(
    input.refreshToken
  );

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  return session;
};

export { domain_readSessionByRefreshToken };
