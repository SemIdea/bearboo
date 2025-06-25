import { IPostModel } from "@/server/entities/post/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IUpdatePostDTO = {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IUpdatePostDTO };
