import { Session } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  ICreateAuthSessionDTO,
  IFindSessionByRefreshTokenDTO,
  IFindUserAndSessionByAccessTokenDTO,
  IRefreshSessionDTO,
} from "./DTO";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { SessionEntity } from "@/server/entities/session/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { AuthErrorCode } from "@/shared/error/auth";

const CreateAuthSessionService = async ({
  repositories,
  ...data
}: ICreateAuthSessionDTO) => {
  const { userId } = data;

  const user = await UserEntity.find({
    id: userId,
    repositories: {
      ...repositories,
      database: repositories.user,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.USER_NOT_FOUD,
    });
  }

  const [sessionId, accessToken, refreshToken] = await Promise.all([
    GenerateSnowflakeUID(),
    GenerateSnowflakeUID(),
    GenerateSnowflakeUID(),
  ]);

  const session = await SessionEntity.create({
    data: {
      userId,
      accessToken,
      refreshToken,
    },
    id: sessionId,
    repositories,
  });

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: AuthErrorCode.SESSION_CREATE_ERROR,
    });
  }

  return session;
};

const FindUserAndSessionByAccessTokenService = async ({
  repositories,
  ...data
}: IFindUserAndSessionByAccessTokenDTO) => {
  const { accessToken } = data;

  const session = await SessionEntity.findByAccessToken({
    accessToken,
    repositories: {
      ...repositories,
    },
  });

  if (!session || !session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.INVALID_TOKEN,
    });
  }

  const user = await UserEntity.find({
    id: session.userId,
    repositories: {
      ...repositories,
      database: repositories.user,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.INVALID_TOKEN,
    });
  }

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...userWithoutPassword,
    session: sessionWithoutUserId,
  } as IUserWithSession;
};

const FindSessionByRefreshTokenService = async ({
  repositories,
  ...data
}: IFindSessionByRefreshTokenDTO) => {
  const session = await SessionEntity.findByRefreshToken({
    repositories,
    ...data,
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.INVALID_TOKEN,
    });
  }

  return session;
};

const RefreshSessionService = async ({
  repositories,
  ...data
}: IRefreshSessionDTO) => {
  const newSession = await SessionEntity.refreshSession({
    id: data.id,
    accessToken: data.newAccessToken,
    refreshToken: data.newRefreshToken,
    repositories,
  });

  if (!newSession) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: AuthErrorCode.SESSION_UPDATE_ERROR,
    });
  }

  return newSession;
};

export {
  CreateAuthSessionService,
  FindUserAndSessionByAccessTokenService,
  FindSessionByRefreshTokenService,
  RefreshSessionService,
};
