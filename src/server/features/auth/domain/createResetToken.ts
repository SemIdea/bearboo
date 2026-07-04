import { DomainInput } from "@/server/createDomain";
import { SendResetPasswordEmailInput } from "../schema";
import { domain_getUserByEmailOrThrow } from "@/server/features/user/domain/getUserByEmailOrThrow";

const domain_createResetToken = async ({
  ctx,
  input
}: DomainInput<SendResetPasswordEmailInput>) => {
  const user = await domain_getUserByEmailOrThrow({
    ctx,
    input: { email: input.email }
  });

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
