import { verifiedProcedure } from "@/server/createRouter";
import { UpdateUserProfileService } from "../domain/updateProfile";
import {
  updateUserProfileSchema,
  updateUserProfileOutputSchema
} from "../schema";

const updateUserProfileProcedure = verifiedProcedure
  .input(updateUserProfileSchema)
  .output(updateUserProfileOutputSchema)
  .mutation(async ({ input, ctx }) =>
    UpdateUserProfileService({ ...input, id: ctx.user.id, ctx })
  );

export { updateUserProfileProcedure };
