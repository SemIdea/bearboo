import { Session } from "@prisma/client";
import {
  ICreateAuthSessionDTO,
  IFindSessionByRefreshTokenDTO,
  IFindUserAndSessionByAccessTokenDTO,
  IRefreshSessionDTO
} from "./DTO";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { SessionEntity } from "@/server/entities/session/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { FieldError } from "@/utils/error";

const CreateAuthSessionService = async ({
  repositories,
  ...data
}: ICreateAuthSessionDTO) => {
  const { userId } = data;

  const user = await UserEntity.find({
    id: userId,
    repositories: {
      database: repositories.user,
      cache: repositories.cache,
    },
  });

  if (!user) {
    throw new Error("User not found");
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
    throw new Error("Failed to create session");
  }

  return session;
};

const FindUserAndSessionByAccessTokenService = async ({
  repositories,
  ...data
}: IFindUserAndSessionByAccessTokenDTO) => {
  const { accessToken } = data;

  const session = (await SessionEntity.findByAccessToken({
    accessToken,
    repositories: {
      database: repositories.database,
      cache: repositories.cache,
    },
  })) as Partial<Session>;

  if (!session || !session.userId) {
    throw new FieldError({
      field: "accessToken",
      reason: "Session not found",
    });
  }

  const user = (await UserEntity.find({
    id: session.userId,
    repositories: {
      database: repositories.user,
      cache: repositories.cache,
    },
  })) as IUserWithSession;

  if (!user) {
    throw new FieldError({
      field: "userId",
      reason: "User not found",
    });
  }

  delete session.userId;
  delete user.password;

  user.session = session as Omit<Session, "userId">;

  return user as Omit<IUserWithSession, "password">;
};

const FindSessionByRefreshTokenService = async ({
  repositories,
  ...data
}: IFindSessionByRefreshTokenDTO) => {
  const session = SessionEntity.findByRefreshToken({
    repositories,
    ...data
  })

  if (!session) {
    throw new Error("Session not found");
  }

  return session;
}

const RefreshSessionService = async ({
  repositories,
  ...data
}: IRefreshSessionDTO) => {
  const newSession = SessionEntity.refreshSession({
    id: data.id,
    accessToken: data.newAccessToken,
    refreshToken: data.newRefreshToken,
    repositories
  });

  if (!newSession) {
    throw new Error("Failed to create session");
  }

  return newSession;
}

export {
  CreateAuthSessionService, FindUserAndSessionByAccessTokenService,
  FindSessionByRefreshTokenService,
  RefreshSessionService
};
