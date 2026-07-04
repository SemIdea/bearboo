import { ICommentModel } from "@/server/models/comment";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { CreateCommentInput } from "../schema";

type Params = CreateCommentInput & {
  userId: string;
  repositories: {
    user: IUserModel;
    database: ICommentModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

const CreateCommentService = async ({
  repositories,
  helpers,
  ...data
}: Params) => {
  const commentId = helpers.uid.generate();

  const comment = await repositories.database.create(commentId, data);

  return comment;
};

export { CreateCommentService };
