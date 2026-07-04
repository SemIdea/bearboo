import { IPostModel } from "@/server/models/post";

type IRevalidatePostDTO = {
  id: string;
  userId: string;
  repositories: {
    database: IPostModel;
  };
};

export type { IRevalidatePostDTO };
