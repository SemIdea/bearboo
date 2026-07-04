import { TRPCError } from "@trpc/server";
import { ICommentModel } from "@/server/models/comment";
import { IUserModel } from "@/server/models/user";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserCommentsInput } from "../schema";

type Params = ReadUserCommentsInput & {
  repositories: {
    database: ICommentModel;
    user: IUserModel;
  };
};

const ReadUserCommentsService = async ({ repositories, id }: Params) => {
  const user = await repositories.user.read(id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const comments = await repositories.database.readAllByUserId(id);

  return comments ?? [];
};

export { ReadUserCommentsService };
