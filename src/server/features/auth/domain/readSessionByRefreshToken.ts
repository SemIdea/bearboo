import { TRPCError } from "@trpc/server";
import { IReadSessionByRefreshTokenDTO } from "./readSessionByRefreshToken.dto";
import { SessionErrorCode } from "@/shared/error/session";

const ReadSessionByRefreshTokenService = async ({
  repositories,
  refreshToken
}: IReadSessionByRefreshTokenDTO) => {
  const session = await repositories.database.readByRefreshToken(refreshToken);

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  return session;
};

export { ReadSessionByRefreshTokenService };
