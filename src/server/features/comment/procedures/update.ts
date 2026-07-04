import { verifiedProcedure } from "@/server/createRouter";
import { UpdateCommentService } from "../domain/update";
import { updateCommentSchema, updateCommentOutputSchema } from "../schema";

const updateCommentProcedure = verifiedProcedure
  .input(updateCommentSchema)
  .output(updateCommentOutputSchema)
  .mutation(async ({ input, ctx }) =>
    UpdateCommentService({ ...input, userId: ctx.user.id, ctx })
  );

export { updateCommentProcedure };
