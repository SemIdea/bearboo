import { TRPCError } from "@trpc/server";
import { IReadSessionByRefreshTokenDTO } from "./readSessionByRefreshToken.dto";
import { SessionEntity } from "@/server/entities/session/entity";
import { SessionErrorCode } from "@/shared/error/session";

const ReadSessionByRefreshTokenService = async ({
  repositories,
  ...data
}: IReadSessionByRefreshTokenDTO) => {
  const session = await SessionEntity.readByRefreshToken({
    ...data,
    repositories
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  return session;
};

export { ReadSessionByRefreshTokenService };
