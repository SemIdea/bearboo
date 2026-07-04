import { prisma } from "@/server/drivers/prisma";
import { BaseModel } from "./base";

type IVerifyTokenEntity = {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  used: boolean;
};

class VerifyTokenModelClass extends BaseModel<IVerifyTokenEntity> {
  constructor() {
    super(prisma.verificationToken);
  }

  async readByToken(token: string): Promise<IVerifyTokenEntity | null> {
    return prisma.verificationToken.findUnique({
      where: {
        token
      }
    });
  }

  async readByUserId(userId: string): Promise<IVerifyTokenEntity | null> {
    return prisma.verificationToken.findFirst({
      where: {
        userId
      }
    });
  }
}

const VerifyTokenModel = new VerifyTokenModelClass();

type IVerifyTokenModel = BaseModel<IVerifyTokenEntity> & {
  readByToken: (token: string) => Promise<IVerifyTokenEntity | null>;
  readByUserId: (userId: string) => Promise<IVerifyTokenEntity | null>;
};

export { VerifyTokenModel };
export type { IVerifyTokenEntity, IVerifyTokenModel };
