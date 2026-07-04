import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { AuthErrorCode } from "@/shared/error/auth";
import { LoginUserInput } from "../schema";
import { domain_getUserByEmailOrThrow } from "./getUserByEmailOrThrow";

const domain_loginUser = async ({
  ctx,
  input
}: DomainInput<LoginUserInput>) => {
  const user = await domain_getUserByEmailOrThrow({
    ctx,
    input: { email: input.email }
  });

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
