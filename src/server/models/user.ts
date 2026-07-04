import { prisma } from "@/server/drivers/prisma";
import { BaseModel } from "./base";
import type { ISessionEntity } from "./session";

type IUserEntity = {
  id: string;
  name: string;
  email: string;
  password: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string | null;
};

type IUserWithSession = Omit<IUserEntity, "password"> & {
  session: Omit<ISessionEntity, "userId">;
};

class UserModelClass extends BaseModel<IUserEntity> {
  constructor() {
    super(prisma.user);
  }

  async readByEmail(email: string): Promise<IUserEntity | null> {
    return prisma.user.findUnique({
      where: {
        email
      }
    });
  }
}

const UserModel = new UserModelClass();

type IUserModel = BaseModel<IUserEntity> & {
  readByEmail: (email: string) => Promise<IUserEntity | null>;
};

export { UserModel };
export type { IUserEntity, IUserWithSession, IUserModel };
