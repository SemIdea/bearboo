import { IReadRecentPostsDTO } from "./DTO";
import { PostEntity } from "@/server/entities/post/entity";

const ReadRecentPostsService = async ({
  repositories
}: IReadRecentPostsDTO) => {
  const posts = await PostEntity.readRecent({
    repositories
  });

  return posts;
};

export { ReadRecentPostsService };
