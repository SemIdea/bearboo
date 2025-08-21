import { VerifyTokenEntity } from "@/server/entities/verifyToken/entity";
import {
  ICreateTokenServiceDTO,
  IReCreateTokenServiceDTO,
  ITokenServiceDTO
} from "./DTO";
import { TRPCError } from "@trpc/server";
import { VerifyTokenErrorCodes } from "@/shared/error/verifyToken";
import { UserEntity } from "@/server/entities/user/entity";
import { UserErrorCode } from "@/shared/error/user";

const CreateTokenService = async ({
  repositories,
  helpers,
  ...data
}: ICreateTokenServiceDTO) => {
  const tokenId = helpers.uid.generate();
  const newToken = helpers.uid.generate();

  const token = await VerifyTokenEntity.create({
    id: tokenId,
    data: {
      ...data,
      token: newToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used: false
    },
    repositories
  });

  return token;
};

const VerifyTokenService = async ({
  repositories,
  ...data
}: ITokenServiceDTO) => {
  const token = await VerifyTokenEntity.readByToken({
    ...data,
    repositories
  });

  if (!token) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: VerifyTokenErrorCodes.TOKEN_NOT_FOUND
    });
  }

  if (token.used) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: VerifyTokenErrorCodes.TOKEN_ALREADY_USED
    });
  }

  if (token.expiresAt < new Date()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: VerifyTokenErrorCodes.TOKEN_EXPIRED
    });
  }

  await UserEntity.update({
    id: token.userId,
    data: {
      verified: true
    },
    repositories: {
      ...repositories,
      database: repositories.user
    }
  });

  const verifiedToken = await VerifyTokenEntity.update({
    id: token.id,
    data: {
      used: true
    },
    repositories
  });

  return verifiedToken;
};

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

export { CreateTokenService, VerifyTokenService, ReCreateTokenService };
