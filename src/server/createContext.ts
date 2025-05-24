import { IUserModel, IUserWithSession } from "./entities/user/DTO";
import { ICacheRepositoryAdapter } from "./integrations/repositories/cache/adapter";
import { ISessionModel } from "./entities/session/DTO";
import { IPasswordHashingHelperAdapter } from "./integrations/helpers/passwordHashing/adapter";
import {
  cacheRepository,
  passwordHashingHelper,
  postRepository,
  sessionRepository,
  userRepository,
} from "./drivers/repositories";
import { IPostModel } from "./entities/post/DTO";

type IInputAPIContextDTO = {
  headers: Headers;
};

type IAPIContextDTO = {
  headers: Headers;
  user?: IUserWithSession;
  repositories: {
    user: IUserModel;
    session: ISessionModel;
    post: IPostModel;
    cache: ICacheRepositoryAdapter;
    hashing: IPasswordHashingHelperAdapter;
  };
};

type IProtectedAPIContextDTO = Omit<IAPIContextDTO, "user"> & {
  user: IUserWithSession;
};

const createTRPCContext = ({
  headers,
}: IInputAPIContextDTO): IAPIContextDTO => {
  return {
    headers,
    repositories: {
      user: userRepository,
      session: sessionRepository,
      post: postRepository,
      cache: cacheRepository,
      hashing: passwordHashingHelper,
    },
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export { createTRPCContext };
export type {
  IInputAPIContextDTO,
  IAPIContextDTO,
  IProtectedAPIContextDTO,
  Context,
};
