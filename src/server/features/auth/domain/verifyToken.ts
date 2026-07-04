import { TRPCError } from "@trpc/server";
import { IVerifyTokenModel } from "@/server/models/verifyToken";
import { IUserModel } from "@/server/models/user";
import { VerifyTokenErrorCodes } from "@/shared/error/verifyToken";
import { VerifyTokenInput } from "../schema";

type Params = VerifyTokenInput & {
  repositories: {
    database: IVerifyTokenModel;
    user: IUserModel;
  };
};

const VerifyTokenService = async ({ repositories, token }: Params) => {
  const verifyToken = await repositories.database.readByToken(token);

  if (!verifyToken) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: VerifyTokenErrorCodes.TOKEN_NOT_FOUND
    });
  }

  if (verifyToken.used) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: VerifyTokenErrorCodes.TOKEN_ALREADY_USED
    });
  }

  if (verifyToken.expiresAt < new Date()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: VerifyTokenErrorCodes.TOKEN_EXPIRED
    });
  }

  await repositories.user.update(verifyToken.userId, {
    verified: true
  });

  const verifiedToken = await repositories.database.update(verifyToken.id, {
    used: true
  });

  return verifiedToken;
};

export { VerifyTokenService };
