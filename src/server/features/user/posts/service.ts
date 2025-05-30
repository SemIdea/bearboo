import { PostEntity } from "@/server/entities/post/entity";
import { IGetUserPostsDTO } from "./DTO";

const GetUserPostsService = async ({
  repositories,
  ...data
}: IGetUserPostsDTO) => {
  const posts = await PostEntity.findUserPosts({
    userId: data.userId,
    repositories,
  });

  return posts;
};

export { GetUserPostsService };
