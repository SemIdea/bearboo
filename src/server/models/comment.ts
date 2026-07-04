import { prisma } from "@/server/drivers/prisma";
import { BaseModel } from "./base";

type ICommentEntity = {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type ICommentEntityWithUser = ICommentEntity & {
  user: {
    name: string;
  };
};

class CommentModelClass extends BaseModel<ICommentEntity> {
  constructor() {
    super(prisma.comment);
  }

  async readAllByPostId(
    postId: string
  ): Promise<ICommentEntityWithUser[] | null> {
    return prisma.comment.findMany({
      where: {
        postId
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
  }

  async readAllByUserId(userId: string): Promise<ICommentEntity[] | null> {
    return prisma.comment.findMany({
      where: {
        userId
      }
    });
  }
}

const CommentModel = new CommentModelClass();

type ICommentModel = BaseModel<ICommentEntity> & {
  readAllByPostId: (postId: string) => Promise<ICommentEntityWithUser[] | null>;
  readAllByUserId: (userId: string) => Promise<ICommentEntity[] | null>;
};

export { CommentModel };
export type { ICommentEntity, ICommentEntityWithUser, ICommentModel };
