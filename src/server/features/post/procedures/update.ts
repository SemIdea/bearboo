import { verifiedProcedure } from "@/server/createRouter";
import { UpdatePostService } from "../domain/update";
import { updatePostSchema, updatePostOutputSchema } from "../schema";

const updatePostProcedure = verifiedProcedure
  .input(updatePostSchema)
  .output(updatePostOutputSchema)
  .mutation(async ({ input, ctx }) =>
    UpdatePostService({ ...input, userId: ctx.user.id, ctx })
  );

export { updatePostProcedure };
