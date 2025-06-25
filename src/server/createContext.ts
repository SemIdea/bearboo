import { IUserModel, IUserWithSession } from "./entities/user/DTO";
import { ICacheRepositoryAdapter } from "./integrations/repositories/cache/adapter";
import { ISessionModel } from "./entities/session/DTO";
import { IPasswordHashingHelperAdapter } from "./integrations/helpers/passwordHashing/adapter";
import {
  cacheRepository,
  commentRepository,
  passwordHashingHelper,
  postRepository,
  sessionRepository,
  userRepository
} from "./drivers/repositories";
import { IPostModel } from "./entities/post/DTO";
import { ICommentModel } from "./entities/comment/DTO";
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadUserAndSessionByAccessTokenService } from "./features/auth/session/service";

type IInputAPIContextDTO = {
  headers: Headers;
};

type IBaseContextDTO = IInputAPIContextDTO & {
  headers: Headers;
  repositories: {
    user: IUserModel;
    session: ISessionModel;
    post: IPostModel;
    cache: ICacheRepositoryAdapter;
    hashing: IPasswordHashingHelperAdapter;
    comment: ICommentModel;
  };
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
    repositories: {
      user: userRepository,
      session: sessionRepository,
      post: postRepository,
      cache: cacheRepository,
      hashing: passwordHashingHelper,
      comment: commentRepository
    }
  };

  const cookies = headers.get("cookie");

  if (!cookies) return ctx;
  const cookieStore = parseCookie(cookies);
  const accessToken = cookieStore.get("accessToken") || null;

  if (!accessToken) return ctx;

  const user = await ReadUserAndSessionByAccessTokenService({
    accessToken,
    repositories: {
      cache: ctx.repositories.cache,
      user: ctx.repositories.user,
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
