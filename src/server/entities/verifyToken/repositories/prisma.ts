import { prisma } from "@/server/drivers/prisma";
import { IVerifyTokenEntity, IVerifyTokenModel } from "../DTO";

class PrismaVerifyTokenModel implements IVerifyTokenModel {
  async create(
    id: string,
    data: Omit<IVerifyTokenEntity, "id" | "createdAt" | "updatedAt">
  ) {
    return await prisma.verificationToken.create({
      data: {
        id,
        ...data
      }
    });
  }

  async read(id: string) {
    return await prisma.verificationToken.findUnique({
      where: {
        id
      }
    });
  }

  async readByToken(token: string): Promise<IVerifyTokenEntity | null> {
    return await prisma.verificationToken.findUnique({
      where: {
        token
      }
    });
  }

  async update(id: string, data: Partial<IVerifyTokenEntity>) {
    return await prisma.verificationToken.update({
      where: {
        id
      },
      data
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.verificationToken.delete({
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

export { PrismaVerifyTokenModel };
