import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { SendResetPasswordEmailInput } from "../schema";

type Input = DomainInput<SendResetPasswordEmailInput>;

const CreateResetTokenService = async ({ ctx, ...data }: Input) => {
  const user = await ctx.repositories.user.readByEmail(data.email);

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

export { CreateResetTokenService };
