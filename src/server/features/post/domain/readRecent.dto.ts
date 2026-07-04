import { IPostModel } from "@/server/models/post";

type IReadRecentPostsDTO = {
  repositories: {
    database: IPostModel;
  };
};

export type { IReadRecentPostsDTO };
