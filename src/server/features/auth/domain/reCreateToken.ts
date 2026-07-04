import { TRPCError } from "@trpc/server";
import { UserErrorCode } from "@/shared/error/user";
import { IReCreateTokenServiceDTO } from "./reCreateToken.dto";
import { CreateTokenService } from "./createToken";

const ReCreateTokenService = async ({
  userEmail,
  repositories,
  helpers
}: IReCreateTokenServiceDTO) => {
  const user = await repositories.user.readByEmail(userEmail);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const existingToken = await repositories.database.readByUserId(user.id);

  if (existingToken) {
    await repositories.database.delete(existingToken.id);
  }

  return CreateTokenService({
    userId: user.id,
    repositories,
    helpers
  });
};

export { ReCreateTokenService };
