import { TRPCError } from "@trpc/server";
import { ISessionModel } from "@/server/models/session";
import { SessionErrorCode } from "@/shared/error/session";
import { RefreshSessionInput } from "../schema";

type Params = RefreshSessionInput & {
  repositories: {
    database: ISessionModel;
  };
};

const ReadSessionByRefreshTokenService = async ({
  repositories,
  refreshToken
}: Params) => {
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
