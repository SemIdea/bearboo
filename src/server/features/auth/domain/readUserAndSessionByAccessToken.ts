import { TRPCError } from "@trpc/server";
import { IReadUserAndSessionByAccessTokenDTO } from "./readUserAndSessionByAccessToken.dto";
import { SessionEntity } from "@/server/entities/session/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { SessionErrorCode } from "@/shared/error/session";

const ReadUserAndSessionByAccessTokenService = async ({
  repositories,
  ...data
}: IReadUserAndSessionByAccessTokenDTO) => {
  const session = await SessionEntity.readByAccessToken({
    ...data,
    repositories
  });

  if (!session || !session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  const user = await UserEntity.read({
    id: session.userId,
    repositories: {
      ...repositories,
      database: repositories.user
    }
  });

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
