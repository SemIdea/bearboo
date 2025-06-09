import { Session, User } from "@prisma/client";
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
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";

type AuthenticatedUser = {
  user: User & {
    input: {
      email: string;
      password: string;
    };
  };
  session: Session;
};

type CreateAuthenticatedUser = () => Promise<AuthenticatedUser>;

type ICreateAuthenticatedContext = {
  ctx: TestContext;
  user: User;
  session: Session;
};

type AuthenticatedContext = TestContext & {
  user: {
    id: string;
    email: string;
    session: Session;
  };
};

type CreateAuthenticatedContext = (
  params: ICreateAuthenticatedContext,
) => AuthenticatedContext;

type Repositories = {
  user: IUserModel;
  session: ISessionModel;
  post: IPostModel;
  cache: ICacheRepositoryAdapter;
  hashing: IPasswordHashingHelperAdapter;
  uuid: () => Promise<string>;
};

type Entities = {
  user: typeof UserEntity;
  session: typeof SessionEntity;
  post: typeof PostEntity;
};

type TestContext = {
  headers: Headers;
  repositories: Repositories;
  entities: Entities;
  createAuthenticatedUser: CreateAuthenticatedUser;
  createAuthenticatedContext: CreateAuthenticatedContext;
};

const generateSnowflakeUuidWithRandom = async (): Promise<string> => {
  const id = await GenerateSnowflakeUID();
  const random = Math.floor(Math.random() * 1000);

  return id + random.toString();
};

const createAuthenticatedUser = async () => {
  const userId = await generateSnowflakeUuidWithRandom();
  const userInput = {
    email: `${userId}@example.com`,
    password: "password123",
  };

  const user = await userRepository.create(userId, {
    ...userInput,
    password: await passwordHashingHelper.hash(userInput.password),
  });

  const sessionId = await generateSnowflakeUuidWithRandom();
  const accessToken = await generateSnowflakeUuidWithRandom();
  const refreshToken = await generateSnowflakeUuidWithRandom();

  const session = await sessionRepository.create(sessionId, {
    userId,
    accessToken,
    refreshToken,
  });

  return {
    user: {
      ...user,
      input: userInput,
    },
    session,
  };
};

const createAuthenticatedContext = ({
  ctx,
  session,
  user,
}: ICreateAuthenticatedContext) => {
  return {
    ...ctx,
    user: {
      id: user.id,
      email: user.email,
      session,
    },
  };
};

const testContext = (): TestContext => {
  const ctx: TestContext = {
    headers: new Headers(),
    repositories: {
      user: userRepository,
      session: sessionRepository,
      post: postRepository,
      cache: cacheRepository,
      hashing: passwordHashingHelper,
      uuid: generateSnowflakeUuidWithRandom,
    },
    entities: {
      user: UserEntity,
      session: SessionEntity,
      post: PostEntity,
    },
    createAuthenticatedUser,
    createAuthenticatedContext,
  };

  return ctx;
};

export { testContext };
export type { TestContext };
