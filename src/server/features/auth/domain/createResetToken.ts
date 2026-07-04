import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { SendResetPasswordEmailInput } from "../schema";

const domain_createResetToken = async ({
  ctx,
  input
}: DomainInput<SendResetPasswordEmailInput>) => {
  const user = await ctx.repositories.user.readByEmail(input.email);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const resetTokenId = ctx.helpers.uid.generate();
  const newResetToken = ctx.helpers.uid.generate();

  const resetToken = await ctx.repositories.resetToken.create(resetTokenId, {
    userId: user.id,
    token: newResetToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    used: false
  });

  return resetToken;
};

export { domain_createResetToken };
