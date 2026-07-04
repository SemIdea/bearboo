import { verifiedProcedure } from "@/server/createRouter";
import { domain_updateComment } from "../domain/update";
import { updateCommentSchema, updateCommentOutputSchema } from "../schema";

const procedure_updateComment = verifiedProcedure
  .input(updateCommentSchema)
  .output(updateCommentOutputSchema)
  .mutation(async ({ input, ctx }) =>
    domain_updateComment({ ctx, input: { ...input, userId: ctx.user.id } })
  );

export { procedure_updateComment };
