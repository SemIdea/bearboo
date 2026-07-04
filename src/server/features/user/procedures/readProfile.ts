import { publicProcedure } from "@/server/createRouter";
import { domain_readUserProfile } from "../domain/readProfile";
import { readUserProfileSchema, readUserProfileOutputSchema } from "../schema";

const procedure_readUserProfile = publicProcedure
  .input(readUserProfileSchema)
  .output(readUserProfileOutputSchema)
  .query(async ({ input, ctx }) => {
    if (ctx.user && input.id === ctx.user.id) {
      const { session, ...userWithoutSession } = ctx.user;

      return userWithoutSession;
    }

    return domain_readUserProfile({ ctx, input });
  });

export { procedure_readUserProfile };
