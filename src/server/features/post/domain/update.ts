import { TRPCError } from "@trpc/server";
import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";
import { PostErrorCode } from "@/shared/error/post";
import { UpdatePostInput } from "../schema";

type Params = UpdatePostInput & {
  userId: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
  };
};

const UpdatePostService = async ({ repositories, ...data }: Params) => {
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
      message: PostErrorCode.POST_UPDATE_FORBIDDEN
    });
  }

  return await repositories.database.update(data.id, {
    title: data.title,
    content: data.content
  });
};

export { UpdatePostService };
