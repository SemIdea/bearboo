import { TRPCError } from "@trpc/server";
import { IDeleteSessionDTO } from "./deleteSession.dto";
import { SessionEntity } from "@/server/entities/session/entity";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

const DeleteSessionService = async ({
  repositories,
  ...data
}: IDeleteSessionDTO) => {
  const user = await UserEntity.read({
    id: data.userId,
    repositories: {
      ...repositories,
      database: repositories.user
    }
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const session = await SessionEntity.read({
    ...data,
    repositories
  });

  if (!session) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: SessionErrorCode.SESSION_NOT_FOUND
    });
  }

  await SessionEntity.delete({
    ...session,
    data: session,
    repositories
  });
};

export { DeleteSessionService };
