import { IPostEntity, IPostModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaPostModel implements IPostModel {
  async create(id: string, data: Omit<IPostEntity, "id">) {
    return await prisma.post.create({
      data: {
        id,
        ...data
      }
    });
  }

  async read(id: string) {
    return await prisma.post.findUnique({
      where: {
        id
      }
    });
  }

  async readAll() {
    return await prisma.post.findMany();
  }

  async readUserPosts(userId: string) {
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

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.post.delete({
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

export { PrismaPostModel };
