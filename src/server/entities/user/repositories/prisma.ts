import { IUserModel, IUserEntity } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaUserModel implements IUserModel {
  async create(id: string, data: IUserEntity) {
    return await prisma.user.create({
      data: {
        id,
        ...data
      }
    });
  }

  async find(id: string) {
    return await prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  async update(id: string, data: IUserEntity) {
    return await prisma.user.update({
      where: {
        id
      },
      data
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: {
        id
      }
    });
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email
      }
    });
  }
}

export { PrismaUserModel };
