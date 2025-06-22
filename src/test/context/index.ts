import {
  cacheRepository,
  commentRepository,
  passwordHashingHelper,
  postRepository,
  sessionRepository,
  userRepository
} from "@/server/drivers/repositories";
import { UserEntity } from "@/server/entities/user/entity";
import { SessionEntity } from "@/server/entities/session/entity";
import { GenerateSnowflakeUID } from "@/server/drivers/snowflake";
import { IBaseContextDTO } from "@/server/createContext";

type IAuthenticatedUserDTO = UserEntity & {
  truePassword: string;
  session: SessionEntity;
};

type ITestContextDTO = IBaseContextDTO & {
  user?: IAuthenticatedUserDTO;
  generateSnowflakeUuid: () => Promise<string>;
  createAuthenticatedUser: () => Promise<void>;
};

type IControllerContextDTO = ITestContextDTO & {
  user: IAuthenticatedUserDTO;
};

class TestContext {
  headers = new Headers();
  repositories = {
    user: userRepository,
    session: sessionRepository,
    post: postRepository,
    cache: cacheRepository,
    hashing: passwordHashingHelper,
    comment: commentRepository
  };

  user?: IAuthenticatedUserDTO;

  async generateSnowflakeUuid() {
    const id = await GenerateSnowflakeUID();
    const random = Math.floor(Math.random() * 1000);

    return id + random.toString();
  }

  async createAuthenticatedUser() {
    const userId = await this.generateSnowflakeUuid();
    const userData = {
      email: `${userId}@example.com`,
      password: "password123"
    };

    const user = await UserEntity.create({
      id: userId,
      data: {
        ...userData,
        password: await this.repositories.hashing.hash(userData.password)
      },
      repositories: {
        ...this.repositories,
        database: this.repositories.user
      }
    });

    const sessionId = await this.generateSnowflakeUuid();
    const accessToken = await this.generateSnowflakeUuid();
    const refreshToken = await this.generateSnowflakeUuid();

    const session = await SessionEntity.create({
      id: sessionId,
      data: {
        userId: user.id,
        accessToken,
        refreshToken
      },
      repositories: {
        ...this.repositories,
        database: this.repositories.session
      }
    });

    this.user = { ...user, truePassword: userData.password, session };
  }
}

function isControllerContext(
  ctx: ITestContextDTO
): ctx is IControllerContextDTO {
  return ctx.user !== undefined;
}

export { TestContext, isControllerContext };
export type { ITestContextDTO, IControllerContextDTO };
