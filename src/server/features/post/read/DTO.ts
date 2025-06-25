import { IPostModel } from "@/server/entities/post/DTO";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type IReadPostDTO = {
  id: string;
  repositories: {
    database: IPostModel;
    cache: ICacheRepositoryAdapter;
  };
};

export type { IReadPostDTO };
