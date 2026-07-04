import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { SessionErrorCode } from "@/shared/error/session";

type Input = DomainInput<{ id: string }>;

const RefreshSessionService = async ({ ctx, ...data }: Input) => {
  const newAccessToken = ctx.helpers.uid.generate();
  const newRefreshToken = ctx.helpers.uid.generate();

  const newSession = await ctx.repositories.session.update(data.id, {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });

  if (!newSession) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: SessionErrorCode.SESSION_UPDATE_ERROR
    });
  }

  return newSession;
};

export { RefreshSessionService };
