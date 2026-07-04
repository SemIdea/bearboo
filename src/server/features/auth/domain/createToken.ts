import { createDomain, DomainInput } from "@/server/createDomain";

const domain_createToken = createDomain(
  async ({ ctx, input }: DomainInput<{ userId: string }>) => {
    const tokenId = ctx.helpers.uid.generate();
    const newToken = ctx.helpers.uid.generate();

    const token = await ctx.repositories.verifyToken.create(tokenId, {
      ...input,
      token: newToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      used: false
    });

    return token;
  }
);

export { domain_createToken };
