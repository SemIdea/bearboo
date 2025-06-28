import { ISessionEntity, ISessionModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaSessionModel implements ISessionModel {
  async create(
    id: string,
    data: Omit<ISessionEntity, "id" | "createdAt" | "updatedAt">
  ) {
    return await prisma.session.create({
      data: {
        id,
        ...data
      }
    });
  }

  async read(id: string) {
    return await prisma.session.findUnique({
      where: {
        id
      }
    });
  }

  async readByAccessToken(accessToken: string) {
    return await prisma.session.findFirst({
      where: {
        accessToken
      }
    });
  }

  async readByRefreshToken(refreshToken: string) {
    return await prisma.session.findFirst({
      where: {
        refreshToken
      }
    });
  }

  async update(id: string, data: Partial<ISessionEntity>) {
    return await prisma.session.update({
      where: {
        id
      },
      data
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.session.delete({
        where: {
          id
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}

export { PrismaSessionModel };
