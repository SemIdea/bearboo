import { TRPCError } from "@trpc/server";
import { createDomain, DomainInput } from "@/server/createDomain";
import { UserErrorCode } from "@/shared/error/user";
import { ReadUserProfileInput } from "../schema";

const domain_readUserProfile = createDomain(
  async ({ ctx, input }: DomainInput<ReadUserProfileInput>) => {
    const userProfile = await ctx.repositories.user.read(input.id);

    if (!userProfile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: UserErrorCode.USER_NOT_FOUND
      });
    }

    const { password, ...userWithoutPassword } = userProfile;

    return userWithoutPassword;
  }
);

export { domain_readUserProfile };
