import { ICommentModel } from "@/server/models/comment";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/server/integrations/helpers/uidGenerator/adapter";

type ICreateCommentDTO = {
  userId: string;
  postId: string;
  content: string;
  repositories: {
    user: IUserModel;
    database: ICommentModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

export type { ICreateCommentDTO };
