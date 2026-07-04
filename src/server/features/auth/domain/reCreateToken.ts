import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { domain_createToken } from "./createToken";

const domain_reCreateToken = async ({
  ctx,
  input
}: DomainInput<{ userEmail: string }>) => {
  const user = await ctx.repositories.user.readByEmail(input.userEmail);

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

  return domain_createToken({ ctx, input: { userId: user.id } });
};

export { domain_reCreateToken };
