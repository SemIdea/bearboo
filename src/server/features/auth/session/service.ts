import { TRPCError } from "@trpc/server";
import {
  ICreateAuthSessionDTO,
  IDeleteSessionDTO,
  IReadSessionByRefreshTokenDTO,
  IReadUserAndSessionByAccessTokenDTO,
  IRefreshSessionDTO
} from "./DTO";
import { SessionEntity } from "@/server/entities/session/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

const CreateAuthSessionService = async ({
  repositories,
  helpers,
  ...data
}: ICreateAuthSessionDTO) => {
  const user = await UserEntity.read({
    id: data.userId,
    repositories: {
      ...repositories,
      database: repositories.user,
      cache: repositories.cache
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const sessionId = helpers.uid.generate();
  const accessToken = helpers.uid.generate();
  const refreshToken = helpers.uid.generate();

  const session = await SessionEntity.create({
    id: sessionId,
    data: {
      userId: user.id,
      accessToken,
      refreshToken
    },
    repositories
  });

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: SessionErrorCode.SESSION_CREATE_ERROR
    });
  }

  return session;
};

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
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const session = await SessionEntity.read({
    ...data,
    repositories
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.SESSION_NOT_FOUND
    });
  }
  
  await SessionEntity.delete({
    ...session,
    data: session,
    repositories
  });
};

export {
  CreateAuthSessionService,
  ReadUserAndSessionByAccessTokenService,
  ReadSessionByRefreshTokenService,
  RefreshSessionService,
  DeleteSessionService
};
