import { ICommentModel } from "@/server/entities/comment/DTO";
import { IUserModel } from "@/server/entities/user/DTO";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";
import { ICacheRepositoryAdapter } from "@/server/integrations/repositories/cache/adapter";

type ICreateCommentDTO = {
  userId: string;
  postId: string;
  content: string;
  repositories: {
    user: IUserModel;
    database: ICommentModel;
    cache: ICacheRepositoryAdapter;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ICreateCommentDTO };
