import { UserEntity } from "@/server/entities/user/entity";
import { SessionEntity } from "@/server/entities/session/entity";
import { IBaseContextDTO } from "@/server/createContext";
import { IUserEntity } from "@/server/entities/user/DTO";
import { ISessionEntity } from "@/server/entities/session/DTO";
import { repositories } from "@/server/container/repositories";
import { helpers } from "@/server/container/helpers";
import { gateways } from "@/server/container/gateways";

type IAuthenticatedUserDTO = IUserEntity & {
  truePassword: string;
  session: ISessionEntity;
};

type ITestContextDTO = IBaseContextDTO & {
  user?: IAuthenticatedUserDTO;
  createAuthenticatedUser: () => Promise<void>;
};

type IControllerContextDTO = ITestContextDTO & {
  user: IAuthenticatedUserDTO;
};

class TestContext {
  headers = new Headers();
  repositories = repositories;
  helpers = helpers;
  gateways = gateways;
  user?: IAuthenticatedUserDTO;
  async createAuthenticatedUser() {
    const userId = this.helpers.uid.generate();
    const userData = {
      email: `${userId}@example.com`,
      name: "Test User",
      password: "password123"
    };

    const user = await UserEntity.create({
      id: userId,
      data: {
        ...userData,
        password: await this.helpers.hashing.hash(userData.password),
        verified: false
      },
      repositories: {
        ...this.repositories,
        database: this.repositories.user
      }
    });

    const sessionId = this.helpers.uid.generate();
    const accessToken = this.helpers.uid.generate();
    const refreshToken = this.helpers.uid.generate();

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
