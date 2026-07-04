import { publicProcedure } from "@/server/createRouter";
import { ReadUserProfileService } from "../domain/readProfile";
import { readUserProfileSchema, readUserProfileOutputSchema } from "../schema";

const readUserProfileProcedure = publicProcedure
  .input(readUserProfileSchema)
  .output(readUserProfileOutputSchema)
  .query(async ({ input, ctx }) => {
    if (ctx.user && input.id === ctx.user.id) {
      const { session, ...userWithoutSession } = ctx.user;

      return userWithoutSession;
    }

    return ReadUserProfileService({ ...input, ctx });
  });

export { readUserProfileProcedure };
