// test/context/index.ts

import { IUserModel } from "@/server/entities/user/DTO";
import { ISessionModel } from "@/server/entities/session/DTO";
import { IPostModel } from "@/server/entities/post/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";
import { IPasswordHashingHelperAdapter } from "@/server/integrations/helpers/passwordHashing/adapter";

import {
  cacheRepository,
  passwordHashingHelper,
  postRepository,
  sessionRepository,
  userRepository,
} from "@/server/drivers/repositories";
import { UserEntity } from "@/server/entities/user/entity";
import { SessionEntity } from "@/server/entities/session/entity";
import { PostEntity } from "@/server/entities/post/entity";

type TestContext = {
  headers: Headers;
  repositories: {
    user: IUserModel;
    session: ISessionModel;
    post: IPostModel;
    cache: ICacheRepositoryAdapter;
    hashing: IPasswordHashingHelperAdapter;
  };
  entities: {
    user: typeof UserEntity;
    session: typeof SessionEntity;
    post: typeof PostEntity;
  };
};

const testContext = (): TestContext => {
  return {
    headers: new Headers(),
    repositories: {
      user: userRepository,
      session: sessionRepository,
      post: postRepository,
      cache: cacheRepository,
      hashing: passwordHashingHelper,
    },
    entities: {
      user: UserEntity,
      session: SessionEntity,
      post: PostEntity,
    },
  };
};

export { testContext };
export type { TestContext };
