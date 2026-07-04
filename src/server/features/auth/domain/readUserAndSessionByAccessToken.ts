import { TRPCError } from "@trpc/server";
import { IReadUserAndSessionByAccessTokenDTO } from "./readUserAndSessionByAccessToken.dto";
import { IUserWithSession } from "@/server/models/user";
import { SessionErrorCode } from "@/shared/error/session";

const ReadUserAndSessionByAccessTokenService = async ({
  repositories,
  accessToken
}: IReadUserAndSessionByAccessTokenDTO) => {
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
