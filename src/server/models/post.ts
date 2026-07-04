import { prisma } from "@/server/infra/drivers/prisma";
import { BaseModel } from "./base";

type IPostEntity = {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

type IPostEntityWithRelations = IPostEntity & {
  user: {
    id: string;
    name: string;
  };
  comments: {
    id: string;
  }[];
};

class PostModelClass extends BaseModel<IPostEntity> {
  constructor() {
    super(prisma.post);
  }

  async readRecents(count: number): Promise<IPostEntityWithRelations[]> {
    return prisma.post.findMany({
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

  async readUserPosts(userId: string): Promise<IPostEntity[]> {
    return prisma.post.findMany({
      where: {
        userId
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

const PostModel = new PostModelClass();

type IPostModel = BaseModel<IPostEntity> & {
  readRecents: (count: number) => Promise<IPostEntityWithRelations[]>;
  readUserPosts: (userId: string) => Promise<IPostEntity[]>;
};

export { PostModel };
export type { IPostEntity, IPostEntityWithRelations, IPostModel };
