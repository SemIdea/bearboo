import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { IUserWithSession } from "@/server/models/user";
import { SessionErrorCode } from "@/shared/error/session";

const domain_readUserAndSessionByAccessToken = async ({
  ctx,
  input
}: DomainInput<{ accessToken: string }>) => {
  const session = await ctx.repositories.session.readByAccessToken(
    input.accessToken
  );

  if (!session || !session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  const user = await ctx.repositories.user.read(session.userId);

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: SessionErrorCode.INVALID_TOKEN
    });
  }

  const { password, ...userWithoutPassword } = user;
  const { userId, ...sessionWithoutUserId } = session;

  return {
    ...userWithoutPassword,
    session: sessionWithoutUserId
  } as IUserWithSession;
};

export { domain_readUserAndSessionByAccessToken };
