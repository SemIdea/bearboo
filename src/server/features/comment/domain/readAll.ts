import { ICommentModel } from "@/server/models/comment";
import { ReadAllCommentsByPostInput } from "../schema";

type Params = ReadAllCommentsByPostInput & {
  repositories: {
    database: ICommentModel;
  };
};

const ReadAllCommentsByPostService = async ({
  repositories,
  postId
}: Params) => {
  const comments = await repositories.database.readAllByPostId(postId);

  return comments ?? [];
};

export { ReadAllCommentsByPostService };
