import { IPostModel } from "@/server/models/post";

type Params = {
  repositories: {
    database: IPostModel;
  };
};

const ReadRecentPostsService = async ({ repositories }: Params) => {
  const posts = await repositories.database.readRecents(30);

  return posts;
};

export { ReadRecentPostsService };
