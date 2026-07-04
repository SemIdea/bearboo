import { TRPCError } from "@trpc/server";
import { IGetUserPostsDTO } from "./readPosts.dto";
import { UserErrorCode } from "@/shared/error/user";

const GetUserPostsService = async ({
  repositories,
  id
}: IGetUserPostsDTO) => {
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
