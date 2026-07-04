import { TRPCError } from "@trpc/server";
import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { DeletePostInput } from "../schema";

type Params = DeletePostInput & {
  userId: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
  };
};

const DeletePostService = async ({ repositories, ...data }: Params) => {
  const post = await repositories.database.read(data.id);

  if (!post) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: PostErrorCode.POST_NOT_FOUND
    });
  }

  if (post.userId !== data.userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: PostErrorCode.POST_DELETE_FORBIDDEN
    });
  }

  const deletedPost = await repositories.database.delete(post.id);

  return deletedPost;
};

export { DeletePostService };
