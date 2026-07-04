import { TRPCError } from "@trpc/server";
import { DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserProfileInput } from "../schema";

type Input = DomainInput<ReadUserProfileInput>;

const ReadUserProfileService = async ({ ctx, id }: Input) => {
  const userProfile = await ctx.repositories.user.read(id);

  if (!userProfile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: UserErrorCode.USER_NOT_FOUND
    });
  }

  const { password, ...userWithoutPassword } = userProfile;

  return userWithoutPassword;
};

export { ReadUserProfileService };
