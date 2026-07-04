import { TRPCError } from "@trpc/server";
import { IDeleteSessionDTO } from "./deleteSession.dto";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

const DeleteSessionService = async ({
  repositories,
  ...data
}: IDeleteSessionDTO) => {
  const user = await repositories.user.read(data.userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const session = await repositories.database.read(data.id);

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.SESSION_NOT_FOUND
    });
  }

  await repositories.database.delete(session.id);
};

export { DeleteSessionService };
