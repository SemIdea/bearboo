import { ICommentEntity, ICommentModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaCommentModel implements ICommentModel {
  async create(
    id: string,
    data: Omit<ICommentEntity, "id" | "createdAt" | "updatedAt">
  ) {
    return await prisma.comment.create({
      data: {
        id,
        ...data
      }
    });
  }

  async read(id: string) {
    return await prisma.comment.findUnique({
      where: {
        id
      }
    });
  }

  async readAllByPostId(postId: string) {
    return await prisma.comment.findMany({
      where: {
        postId
      }
    });
  }

  async readAllByUserId(userId: string) {
    return await prisma.comment.findMany({
      where: {
        userId
      }
    });
  }

  async update(id: string, data: Partial<ICommentEntity>) {
    return await prisma.comment.update({
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
      await prisma.comment.delete({
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

export { PrismaCommentModel };
