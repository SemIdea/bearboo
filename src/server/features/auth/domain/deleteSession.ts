import { TRPCError } from "@trpc/server";
import { ISessionModel } from "@/server/models/session";
import { IUserModel } from "@/server/models/user";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

type Params = {
  id: string;
  userId: string;
  repositories: {
    user: IUserModel;
    database: ISessionModel;
  };
};

const DeleteSessionService = async ({ repositories, ...data }: Params) => {
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
