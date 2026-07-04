import { IPostModel } from "@/server/models/post";
import { IUserModel } from "@/server/models/user";
import { IUidGeneratorHelperAdapter } from "@/lib/uidGenerator/adapter";
import { CreatePostInput } from "../schema";

type Params = CreatePostInput & {
  userId: string;
  repositories: {
    user: IUserModel;
    database: IPostModel;
  };
  helpers: {
    uid: IUidGeneratorHelperAdapter;
  };
};

const CreatePostService = async ({
  repositories,
  helpers,
  ...data
}: Params) => {
  const postId = helpers.uid.generate();

  const post = await repositories.database.create(postId, data);

  return post;
};

export { CreatePostService };
