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

const refreshSessionController = async ({
  input,
  ctx
}: {
  input: RefreshSessionInput;
  ctx: IAPIContextDTO;
}) => {
  const session = await ReadSessionByRefreshTokenService({
    ...input,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    }
  });

  const newSession = await RefreshSessionService({
    ...session,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    },
    helpers: ctx.helpers
  });

  return newSession;
};

const readUserFromSessionController = async ({
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
    ...session,
    userId: ctx.user.id,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    }
  });
};

export {
  refreshSessionController,
  readUserFromSessionController,
  logoutUserFromSessionController
};
