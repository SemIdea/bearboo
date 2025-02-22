import { IUserModel, IUserWithSession } from "./entities/user/DTO";
import { ICacheRepositoryAdapter } from "./integrations/repositories/cache/adapter";
import { ISessionModel } from "./entities/session/DTO";
import { IPasswordHashingHelperAdapter } from "./integrations/helpers/passwordHashing/adapter";
import {
  cacheRepository,
  passwordHashingHelper,
  sessionRepository,
  userRepository,
} from "./drivers/repositories";

type IInputAPIContextDTO = {
  headers: Headers;
};

type IAPIContextDTO = {
  headers: Headers;
  user?: IUserWithSession;
  repositories: {
    cache: ICacheRepositoryAdapter;
    user: IUserModel;
    session: ISessionModel;
    hashing: IPasswordHashingHelperAdapter;
  };
};

const createTRPCContext = ({
  headers,
}: IInputAPIContextDTO): IAPIContextDTO => {
  return {
    headers,
    repositories: {
      cache: cacheRepository,
      user: userRepository,
      session: sessionRepository,
      hashing: passwordHashingHelper,
    },
  };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

export { createTRPCContext };
export type { IInputAPIContextDTO, IAPIContextDTO, Context };
