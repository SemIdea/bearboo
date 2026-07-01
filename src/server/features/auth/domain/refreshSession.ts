import { TRPCError } from "@trpc/server";
import { IRefreshSessionDTO } from "./refreshSession.dto";
import { SessionEntity } from "@/server/entities/session/entity";
import { SessionErrorCode } from "@/shared/error/session";

const RefreshSessionService = async ({
  repositories,
  helpers,
  ...data
}: IRefreshSessionDTO) => {
  const newAccessToken = helpers.uid.generate();
  const newRefreshToken = helpers.uid.generate();

  const newSession = await SessionEntity.refreshSession({
    ...data,
    data: {
      ...data,
      newAccessToken: newAccessToken,
      newRefreshToken: newRefreshToken
    },
    repositories
  });

  if (!newSession) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: SessionErrorCode.SESSION_UPDATE_ERROR
    });
  }

  return newSession;
};

export { RefreshSessionService };
