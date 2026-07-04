import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { SessionErrorCode } from "@/shared/error/session";
import { RefreshSessionInput } from "../schema";

type Input = DomainInput<RefreshSessionInput>;

const ReadSessionByRefreshTokenService = async ({
  ctx,
  refreshToken
}: Input) => {
  const session =
    await ctx.repositories.session.readByRefreshToken(refreshToken);

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  return session;
};

export { ReadSessionByRefreshTokenService };
