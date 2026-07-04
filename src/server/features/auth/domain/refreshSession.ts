import { TRPCError } from "@trpc/server";
import { ISessionModel } from "@/server/models/session";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { SessionErrorCode } from "@/shared/error/session";

type Params = {
  id: string;
  repositories: {
    database: ISessionModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

const RefreshSessionService = async ({
  repositories,
  helpers,
  ...data
}: Params) => {
  const newAccessToken = helpers.uid.generate();
  const newRefreshToken = helpers.uid.generate();

  const newSession = await repositories.database.update(data.id, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
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
