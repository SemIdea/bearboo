import { TRPCError } from "@trpc/server";
import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserPostsInput } from "../schema";

type Params = ReadUserPostsInput & {
  repositories: {
    database: IPostModel;
    user: IUserModel;
  };
};

const GetUserPostsService = async ({ repositories, id }: Params) => {
  const user = await repositories.user.read(id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const posts = await repositories.database.readUserPosts(id);

  return posts;
};

export { GetUserPostsService };
