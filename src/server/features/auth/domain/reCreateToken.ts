import { VerifyTokenEntity } from "@/server/entities/verifyToken/entity";
import { TRPCError } from "@trpc/server";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";
import { IReCreateTokenServiceDTO } from "./reCreateToken.dto";
import { CreateTokenService } from "./createToken";

const ReCreateTokenService = async ({
  userEmail,
  repositories,
  helpers
}: IReCreateTokenServiceDTO) => {
  const user = await UserEntity.readByEmail({
    email: userEmail,
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

  const existingToken = await VerifyTokenEntity.readByUserId({
    userId: user.id,
    repositories
  });

  if (existingToken) {
    await VerifyTokenEntity.delete({
      id: existingToken.id,
      data: existingToken,
      repositories
    });
  }

  return CreateTokenService({
    userId: user.id,
    repositories,
    helpers
  });
};

export { ReCreateTokenService };
