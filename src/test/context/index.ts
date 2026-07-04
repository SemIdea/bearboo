import { IBaseContextDTO } from "@/server/createContext";
import { IUserEntity } from "@/server/models/user";
import { ISessionEntity } from "@/server/models/session";
import { repositories } from "@/server/infra/container/repositories";
import { helpers } from "@/server/infra/container/helpers";
import { gateways } from "@/server/infra/container/gateways";

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

    const user = await this.repositories.user.create(userId, {
      ...userData,
      password: await this.helpers.hashing.hash(userData.password),
      verified: true
    });

    const sessionId = this.helpers.uid.generate();
    const accessToken = this.helpers.uid.generate();
    const refreshToken = this.helpers.uid.generate();

    const session = await this.repositories.session.create(sessionId, {
      userId: user.id,
      accessToken,
      refreshToken
    });

    this.user = { ...user, truePassword: userData.password, session };
  }

  async createNewUser() {
    const userId = this.helpers.uid.generate();
    const userData = {
      email: `${userId}@example.com`,
      name: "Test User",
      password: "password123"
    };

    const user = await this.repositories.user.create(userId, {
      ...userData,
      password: await this.helpers.hashing.hash(userData.password),
      verified: false
    });

    return user;
  }
}

function isControllerContext(
  ctx: ITestContextDTO
): ctx is IControllerContextDTO {
  return ctx.user !== undefined;
}

export { TestContext, isControllerContext };
export type { ITestContextDTO, IControllerContextDTO };
