import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ResetTokenErrorCodes } from "@/shared/error/resetToken";

const domain_resetPassword = async ({
  ctx,
  input
}: DomainInput<{
  token: string;
  newPassword: string;
}>) => {
  const resetToken = await ctx.repositories.resetToken.readByToken(
    input.token
  );

  if (!resetToken) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: ResetTokenErrorCodes.TOKEN_NOT_FOUND
    });
  }

  if (resetToken.used) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ResetTokenErrorCodes.TOKEN_ALREADY_USED
    });
  }

  if (resetToken.expiresAt < new Date()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: ResetTokenErrorCodes.TOKEN_EXPIRED
    });
  }

  const user = await ctx.repositories.user.read(resetToken.userId);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  await ctx.repositories.resetToken.update(resetToken.id, {
    used: true
  });

  const updatedUser = await ctx.repositories.user.update(user.id, {
    password: await ctx.helpers.hashing.hash(input.newPassword)
  });

  return updatedUser;
};

export { domain_resetPassword };
