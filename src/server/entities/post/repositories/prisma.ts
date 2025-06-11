import { IPostEntity, IPostModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaPostModel implements IPostModel {
  async create(id: string, data: IPostEntity) {
    return await prisma.post.create({
      data: {
        id,
        ...data
      }
    });
  }

  async find(id: string) {
    return await prisma.post.findUnique({
      where: {
        id
      }
    });
  }

  async findAll() {
    return await prisma.post.findMany();
  }

  async findUserPosts(userId: string) {
    return await prisma.post.findMany({
      where: {
        userId
      }
    });
  }

  async update(id: string, data: Partial<IPostEntity>) {
    return await prisma.post.update({
      where: {
        id
      },
      data: {
        ...data
      }
    });
  }

  async delete(id: string) {
    await prisma.post.delete({
      where: {
        id
      }
    });
  }
}

export { PrismaPostModel };
