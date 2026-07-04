import { prisma } from "@/server/drivers/prisma";
import { BaseModel } from "./base";
import type { IUserEntity } from "./user";

type ISessionEntity = {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
};

type ISessionWithUser = Omit<ISessionEntity, "userId" | "id"> & {
  user: Omit<IUserEntity, "password">;
};

class SessionModelClass extends BaseModel<ISessionEntity> {
  constructor() {
    super(prisma.session);
  }

  async readByAccessToken(accessToken: string): Promise<ISessionEntity | null> {
    return prisma.session.findFirst({
      where: {
        accessToken
      }
    });
  }

  async readByRefreshToken(
    refreshToken: string
  ): Promise<ISessionEntity | null> {
    return prisma.session.findFirst({
      where: {
        refreshToken
      }
    });
  }
}

const SessionModel = new SessionModelClass();

type ISessionModel = BaseModel<ISessionEntity> & {
  readByAccessToken: (accessToken: string) => Promise<ISessionEntity | null>;
  readByRefreshToken: (
    refreshToken: string
  ) => Promise<ISessionEntity | null>;
};

export { SessionModel };
export type { ISessionEntity, ISessionWithUser, ISessionModel };
