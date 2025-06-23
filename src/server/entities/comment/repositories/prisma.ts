import { ICommentEntity, ICommentModel } from "../DTO";
import { prisma } from "@/server/drivers/prisma";

class PrismaCommentModel implements ICommentModel {
  async create(id: string, data: ICommentEntity) {
    return await prisma.comment.create({
      data: {
        id,
        ...data
      }
    });
  }

  async find(id: string) {
    return await prisma.comment.findUnique({
      where: {
        id
      }
    });
  }

  async findAllByPostId(postId: string) {
    return await prisma.comment.findMany({
      where: {
        postId
      }
    });
  }

  async findAllByUserId(userId: string) {
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

  async delete(id: string) {
    await prisma.comment.delete({
      where: {
        id
      }
    });
  }
}

export { PrismaCommentModel };
