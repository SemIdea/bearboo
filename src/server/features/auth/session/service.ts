import { TRPCError } from "@trpc/server";
import {
  ICreateAuthSessionDTO,
  IDeleteSessionDTO,
  IReadSessionByRefreshTokenDTO,
  IReadUserAndSessionByAccessTokenDTO,
  IRefreshSessionDTO
} from "./DTO";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { SessionEntity } from "@/server/entities/session/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { AuthErrorCode } from "@/shared/error/auth";
import { UserErrorCode } from "@/shared/error/user";

const CreateAuthSessionService = async ({
  repositories,
  ...data
}: ICreateAuthSessionDTO) => {
  const { userId } = data;

  const user = await UserEntity.read({
    id: userId,
    repositories: {
      ...repositories,
      database: repositories.user,
      cache: repositories.cache
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUD
    });
  }

  const [sessionId, accessToken, refreshToken] = await Promise.all([
    GenerateSnowflakeUID(),
    GenerateSnowflakeUID(),
    GenerateSnowflakeUID()
  ]);

  const session = await SessionEntity.create({
    data: {
      userId,
      accessToken,
      refreshToken
    },
    id: sessionId,
    repositories
  });

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: AuthErrorCode.SESSION_CREATE_ERROR
    });
  }

  return session;
};

const ReadUserAndSessionByAccessTokenService = async ({
  repositories,
  ...data
}: IReadUserAndSessionByAccessTokenDTO) => {
  const { accessToken } = data;

  const session = await SessionEntity.readByAccessToken({
    accessToken,
    repositories: {
      ...repositories
    }
  });

  if (!session || !session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.INVALID_TOKEN
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
      message: AuthErrorCode.INVALID_TOKEN
    });
  }

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...userWithoutPassword,
    session: sessionWithoutUserId
  } as IUserWithSession;
};

const ReadSessionByRefreshTokenService = async ({
  repositories,
  ...data
}: IReadSessionByRefreshTokenDTO) => {
  const session = await SessionEntity.readByRefreshToken({
    repositories,
    ...data
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: AuthErrorCode.INVALID_TOKEN
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
    accessToken: data.accessToken,
    newAccessToken: data.newAccessToken,
    newRefreshToken: data.newRefreshToken,
    repositories
  });

  if (!newSession) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: AuthErrorCode.SESSION_UPDATE_ERROR
    });
  }

  return newSession;
};

const DeleteSessionService = async ({
  repositories,
  ...data
}: IDeleteSessionDTO) => {
  const user = await UserEntity.read({
    id: data.userId,
    repositories: {
      ...repositories,
      database: repositories.user
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUD
    });
  }

  const session = await SessionEntity.read({
    id: data.sessionId,
    repositories: {
      ...repositories
    }
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Session not found"
    });
  }

  if (session.userId !== user.id) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You can't delete this session"
    });
  }

  await SessionEntity.delete({
    id: data.sessionId,
    repositories: {
      ...repositories
    }
  });
};

export {
  CreateAuthSessionService,
  ReadUserAndSessionByAccessTokenService,
  ReadSessionByRefreshTokenService,
  RefreshSessionService,
  DeleteSessionService
};
