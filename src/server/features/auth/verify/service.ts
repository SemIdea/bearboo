import { TokenEntity } from "@/server/entities/token/entity";
import { ICreateTokenServiceDTO, ITokenServiceDTO } from "./DTO";
import { TRPCError } from "@trpc/server";
import { TokenErrorCodes } from "@/shared/error/token";
import { UserEntity } from "@/server/entities/user/entity";

const CreateTokenService = async ({
  repositories,
  helpers,
  ...data
}: ICreateTokenServiceDTO) => {
  const tokenId = helpers.uid.generate();
  const newToken = helpers.uid.generate();

  const token = await TokenEntity.create({
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
  const token = await TokenEntity.readByToken({
    ...data,
    repositories
  });

  if (!token) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: TokenErrorCodes.TOKEN_NOT_FOUND
    });
  }

  if (token.used) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: TokenErrorCodes.TOKEN_ALREADY_USED
    });
  }

  if (token.expiresAt < new Date()) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: TokenErrorCodes.TOKEN_EXPIRED
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

  const verifiedToken = await TokenEntity.update({
    id: token.id,
    data: {
      used: true
    },
    repositories
  });

  return verifiedToken;
};

export { CreateTokenService, VerifyTokenService };
