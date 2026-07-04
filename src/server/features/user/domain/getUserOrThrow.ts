import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";

const domain_getUserOrThrow = async ({
  ctx,
  input
}: DomainInput<{ id: string }>) => {
  const user = await ctx.repositories.user.read(input.id);

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  return user;
};

export { domain_getUserOrThrow };
