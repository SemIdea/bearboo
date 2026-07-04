import { DomainInput } from "@/server/createDomain";
import { domain_createToken } from "./createToken";
import { domain_getUserByEmailOrThrow } from "@/server/features/user/domain/getUserByEmailOrThrow";

const domain_reCreateToken = async ({
  ctx,
  input
}: DomainInput<{ userEmail: string }>) => {
  const user = await domain_getUserByEmailOrThrow({
    ctx,
    input: { email: input.userEmail }
  });

  const existingToken = await ctx.repositories.verifyToken.readByUserId(
    user.id
  );

  if (existingToken) {
    await ctx.repositories.verifyToken.delete(existingToken.id);
  }

  return domain_createToken({ ctx, input: { userId: user.id } });
};

export { domain_reCreateToken };
