import { TRPCError } from "@trpc/server";
import { ICreateAuthSessionDTO } from "./createAuthSession.dto";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

const CreateAuthSessionService = async ({
  repositories,
  helpers,
  ...data
}: ICreateAuthSessionDTO) => {
  const user = await repositories.user.read(data.userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const sessionId = helpers.uid.generate();
  const accessToken = helpers.uid.generate();
  const refreshToken = helpers.uid.generate();

  const session = await repositories.database.create(sessionId, {
    userId: user.id,
    accessToken,
    refreshToken
  });

  if (!session) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: SessionErrorCode.SESSION_CREATE_ERROR
    });
  }

  return session;
};

export { CreateAuthSessionService };
