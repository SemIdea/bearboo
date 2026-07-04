import { DomainInput } from "@/server/createDomain";

type Input = DomainInput<{ userId: string }>;

const CreateTokenService = async ({ ctx, ...data }: Input) => {
  const tokenId = ctx.helpers.uid.generate();
  const newToken = ctx.helpers.uid.generate();

  const token = await ctx.repositories.verifyToken.create(tokenId, {
    ...data,
    token: newToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    used: false
  });

  return token;
};

export { CreateTokenService };
