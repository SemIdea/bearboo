import { ISessionEntity, ISessionModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaSessionModel implements ISessionModel {
  async create(id: string, data: ISessionEntity) {
    return await prisma.session.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async find(id: string) {
    return await prisma.session.findUnique({
      where: {
        id,
      },
    });
  }

  async findByAccessToken(accessToken: string) {
    return await prisma.session.findFirst({
      where: {
        accessToken,
      },
    });
  }

  async findByRefreshToken(refreshToken: string) {
    return await prisma.session.findFirst({
      where: {
        refreshToken,
      },
    });
  }

  async update(id: string, data: Partial<ISessionEntity>) {
    return await prisma.session.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.session.delete({
      where: {
        id,
      },
    });
  }
}

export { PrismaSessionModel };
