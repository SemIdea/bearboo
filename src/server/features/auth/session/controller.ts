import {
  DeleteSessionService,
  ReadSessionByRefreshTokenService,
  RefreshSessionService
} from "./service";
import {
  IAPIContextDTO,
  IProtectedAPIContextDTO
} from "@/server/createContext";
import { RefreshSessionInput } from "@/server/schema/session.schema";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

const refreshSessionController = async ({
  input,
  ctx
}: {
  input: RefreshSessionInput;
  ctx: IAPIContextDTO;
}) => {
  const session = await ReadSessionByRefreshTokenService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    },
    ...input
  });

  const newAccessToken = await GenerateSnowflakeUID();
  const newRefreshToken = await GenerateSnowflakeUID();

  await RefreshSessionService({
    id: session.id,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    newAccessToken,
    newRefreshToken,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    }
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const getUserFromSessionController = async ({
  ctx
}: {
  ctx: IProtectedAPIContextDTO;
}) => {
  return ctx.user;
};

const logoutUserFromSessionController = async ({
  ctx
}: {
  ctx: IProtectedAPIContextDTO;
}) => {
  const session = ctx.user.session;

  await DeleteSessionService({
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    },
    userId: ctx.user.id,
    sessionId: session.id
  });
};

export {
  refreshSessionController,
  getUserFromSessionController,
  logoutUserFromSessionController
};
