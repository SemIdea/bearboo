import { verifiedProcedure } from "@/server/createRouter";
import { domain_updateUserProfile } from "../domain/updateProfile";
import {
  updateUserProfileSchema,
  updateUserProfileOutputSchema
} from "../schema";

const procedure_updateUserProfile = verifiedProcedure
  .input(updateUserProfileSchema)
  .output(updateUserProfileOutputSchema)
  .mutation(async ({ input, ctx }) =>
    domain_updateUserProfile({ ctx, input: { ...input, id: ctx.user.id } })
  );

export { procedure_updateUserProfile };
