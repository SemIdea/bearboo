import { TRPCError } from "@trpc/server";
import { IGetUserCommentsDTO } from "./readComments.dto";
import { UserErrorCode } from "@/shared/error/user";

const ReadUserCommentsService = async ({
  repositories,
  id
}: IGetUserCommentsDTO) => {
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
