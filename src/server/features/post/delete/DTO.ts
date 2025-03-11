import { IPostModel } from "@/server/entities/post/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IDeletePostDTO = {
  userId: string;
  postId: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IDeletePostDTO };
