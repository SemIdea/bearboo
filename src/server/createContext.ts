import { IUserWithSession } from "./entities/user/DTO";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadUserAndSessionByAccessTokenService } from "./features/auth/session/service";
import { IRepositories, repositories } from "./container/repositories";
import { IHelpers, helpers } from "./container/helpers";

type IInputAPIContextDTO = {
  headers: Headers;
};

type IBaseContextDTO = IInputAPIContextDTO & {
  headers: Headers;
  repositories: IRepositories;
  helpers: IHelpers;
};

type IAPIContextDTO = IBaseContextDTO & {
  user?: IUserWithSession;
};

type IProtectedAPIContextDTO = IBaseContextDTO & {
  user: IUserWithSession;
};

const createTRPCContext = async ({
  headers
}: IInputAPIContextDTO): Promise<IAPIContextDTO> => {
  const ctx: IAPIContextDTO = {
    headers,
    repositories,
    helpers
  };

  const cookies = headers.get("cookie");

  if (!cookies) return ctx;
  const cookieStore = parseCookie(cookies);
  const accessToken = cookieStore.get("accessToken") || null;

  if (!accessToken) return ctx;

  const user = await ReadUserAndSessionByAccessTokenService({
    accessToken,
    repositories: {
      ...ctx.repositories,
      database: ctx.repositories.session
    }
  });

  if (!user) return ctx;

  ctx.user = user;

  return ctx;
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export { createTRPCContext };
export type {
  IInputAPIContextDTO,
  IBaseContextDTO,
  IAPIContextDTO,
  IProtectedAPIContextDTO,
  Context
};
