import { IPostEntity, IPostModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaPostModel implements IPostModel {
  async create(id: string, data: IPostEntity) {
    return await prisma.post.create({
      data: {
        id,
        ...data,
      },
    });
  }

  async read(id: string) {
    return await prisma.post.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: Partial<IPostEntity>) {
    return await prisma.post.update({
      where: {
        id,
      },
      data: {
        ...data,
      },
    });
  }

  async delete(id: string) {
    await prisma.post.delete({
      where: {
        id,
      },
    });
  }
}

export { PrismaPostModel };
