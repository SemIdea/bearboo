import { prisma } from "@/server/drivers/prisma";
import { IResetTokenModel, IResetTokenEntity } from "../DTO";

class PrismaResetTokenModel implements IResetTokenModel {
  async create(
    id: string,
    data: Omit<IResetTokenEntity, "id" | "createdAt" | "updatedAt">
  ): Promise<IResetTokenEntity> {
    return await prisma.resetToken.create({
      data: {
        id,
        ...data
      }
    });
  }

  async read(id: string): Promise<IResetTokenEntity | null> {
    return await prisma.resetToken.findUnique({
      where: {
        id
      }
    });
  }

  async readByToken(token: string): Promise<IResetTokenEntity | null> {
    return await prisma.resetToken.findUnique({
      where: {
        token
      }
    });
  }

  async readByUserId(userId: string): Promise<IResetTokenEntity | null> {
    return await prisma.resetToken.findFirst({
      where: {
        userId
      }
    });
  }

  async update(
    id: string,
    data: Partial<IResetTokenEntity>
  ): Promise<IResetTokenEntity> {
    return await prisma.resetToken.update({
      where: {
        id
      },
      data
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.resetToken.delete({
        where: {
          id
        }
      });

      return true;
    } catch {
      return false;
    }
  }
}

export { PrismaResetTokenModel };
