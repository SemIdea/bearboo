import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { VerifyTokenErrorCodes } from "@/shared/error/verifyToken";
import { VerifyTokenInput } from "../schema";

type Input = DomainInput<VerifyTokenInput>;

const VerifyTokenService = async ({ ctx, token }: Input) => {
  const verifyToken = await ctx.repositories.verifyToken.readByToken(token);

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

  await ctx.repositories.user.update(verifyToken.userId, {
    verified: true
  });

  const verifiedToken = await ctx.repositories.verifyToken.update(
    verifyToken.id,
    {
      used: true
    }
  );

  return verifiedToken;
};

export { VerifyTokenService };
