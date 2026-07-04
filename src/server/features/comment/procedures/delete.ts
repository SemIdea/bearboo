import { verifiedProcedure } from "@/server/createRouter";
import { domain_deleteComment } from "../domain/delete";
import { deleteCommentSchema, deleteCommentOutputSchema } from "../schema";

const procedure_deleteComment = verifiedProcedure
  .input(deleteCommentSchema)
  .output(deleteCommentOutputSchema)
  .mutation(async ({ input, ctx }) =>
    domain_deleteComment({ ctx, input: { ...input, userId: ctx.user.id } })
  );

export { procedure_deleteComment };
