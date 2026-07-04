import { TRPCError } from "@trpc/server";
import { ISessionModel } from "@/server/models/session";
import { IUserModel, IUserWithSession } from "@/server/models/user";
import { SessionErrorCode } from "@/shared/error/session";

type Params = {
  accessToken: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
};

const ReadUserAndSessionByAccessTokenService = async ({
  repositories,
  accessToken
}: Params) => {
  const session = await repositories.database.readByAccessToken(accessToken);

  if (!session || !session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  const user = await repositories.user.read(session.userId);

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...userWithoutPassword,
    session: sessionWithoutUserId
  } as IUserWithSession;
};

export { ReadUserAndSessionByAccessTokenService };
