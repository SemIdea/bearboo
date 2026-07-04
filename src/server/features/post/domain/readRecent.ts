import { IReadRecentPostsDTO } from "./readRecent.dto";

const ReadRecentPostsService = async ({
  repositories
}: IReadRecentPostsDTO) => {
  const posts = await repositories.database.readRecents(30);

  return posts;
};

export { ReadRecentPostsService };
