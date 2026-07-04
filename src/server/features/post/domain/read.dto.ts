import { IPostModel } from "@/server/models/post";

type IReadPostDTO = {
  id: string;
  repositories: {
    database: IPostModel;
  };
};

export type { IReadPostDTO };
