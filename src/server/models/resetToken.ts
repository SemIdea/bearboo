import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IResetTokenEntity = {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
  used: boolean;
};

class ResetTokenModelClass extends BaseModel<IResetTokenEntity> {
  constructor() {
    super(prisma.resetToken);
  }

  async readByToken(token: string): Promise<IResetTokenEntity | null> {
    return prisma.resetToken.findUnique({
      where: {
        token
      }
    });
  }

  async readByUserId(userId: string): Promise<IResetTokenEntity | null> {
    return prisma.resetToken.findFirst({
      where: {
        userId
      }
    });
  }
}

const ResetTokenModel = new ResetTokenModelClass();

type IResetTokenModel = BaseModel<IResetTokenEntity> & {
  readByToken: (token: string) => Promise<IResetTokenEntity | null>;
  readByUserId: (userId: string) => Promise<IResetTokenEntity | null>;
};

export { ResetTokenModel };
export type { IResetTokenEntity, IResetTokenModel };
