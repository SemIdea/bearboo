import { IPostEntity, IPostModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaPostModel implements IPostModel {
  async create(
    id: string,
    data: Omit<IPostEntity, "id" | "createdAt" | "updatedAt">
  ) {
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

  async readRecents(count: number) {
    return await prisma.post.findMany({
      take: count,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
          select: {
            id: true
          }
        }
      }
    });
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
      await prisma.$transaction(async (tx) => {
        await tx.comment.deleteMany({
          where: {
            postId: id
          }
        });

        await tx.post.delete({
          where: {
            id
          }
        });
      });

      return true;
    } catch {
      return false;
    }
  }
}

export { PrismaPostModel };
