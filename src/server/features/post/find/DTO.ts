import { IPostModel } from "@/server/entities/post/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IFindPostDTO = {
  postId: string;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IFindPostDTO };
