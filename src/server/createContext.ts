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

type IInputAPIContextDTO = {
  headers?: Headers;
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

const createTRPCContext = ({
  headers
}: IInputAPIContextDTO): IAPIContextDTO => {
  return {
    headers: headers != null ? headers : new Headers(),
    repositories: {
      user: userRepository,
      session: sessionRepository,
      post: postRepository,
      cache: cacheRepository,
      hashing: passwordHashingHelper,
      comment: commentRepository
    }
  };
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
