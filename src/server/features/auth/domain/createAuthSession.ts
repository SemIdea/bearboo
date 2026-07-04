import { TRPCError } from "@trpc/server";
import { createDomain, DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { SessionErrorCode } from "@/shared/error/session";

const domain_createAuthSession = createDomain(
  async ({ ctx, input }: DomainInput<{ userId: string }>) => {
    const user = await ctx.repositories.user.read(input.userId);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      });
    }

    const sessionId = ctx.helpers.uid.generate();
    const accessToken = ctx.helpers.uid.generate();
    const refreshToken = ctx.helpers.uid.generate();

    const session = await ctx.repositories.session.create(sessionId, {
      userId: user.id,
      accessToken,
      refreshToken
    });

    if (!session) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: SessionErrorCode.SESSION_CREATE_ERROR
      });
    }

    return session;
  }
);

export { domain_createAuthSession };
