import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { CreateTokenService } from "./createToken";

type Input = DomainInput<{ userEmail: string }>;

const ReCreateTokenService = async ({ userEmail, ctx }: Input) => {
  const user = await ctx.repositories.user.readByEmail(userEmail);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const existingToken = await ctx.repositories.verifyToken.readByUserId(
    user.id
  );

  if (existingToken) {
    await ctx.repositories.verifyToken.delete(existingToken.id);
  }

  return CreateTokenService({
    userId: user.id,
    ctx
  });
};

export { ReCreateTokenService };
