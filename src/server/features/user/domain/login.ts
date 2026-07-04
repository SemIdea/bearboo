import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { AuthErrorCode } from "@/shared/error/auth";
import { UserErrorCode } from "@/shared/error/user";
import { LoginUserInput } from "../schema";

const domain_loginUser = async ({
  ctx,
  input
}: DomainInput<LoginUserInput>) => {
  const user = await ctx.repositories.user.readByEmail(input.email);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const isSamePassword = await ctx.helpers.hashing.compare(
    input.password,
    user.password
  );

  if (!isSamePassword) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: AuthErrorCode.INVALID_CREDENTIALS
    });
  }

  return user;
};

export { domain_loginUser };
