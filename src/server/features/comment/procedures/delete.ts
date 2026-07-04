import { verifiedProcedure } from "@/server/createRouter";
import { DeleteCommentService } from "../domain/delete";
import { deleteCommentSchema, deleteCommentOutputSchema } from "../schema";

const deleteCommentProcedure = verifiedProcedure
  .input(deleteCommentSchema)
  .output(deleteCommentOutputSchema)
  .mutation(async ({ input, ctx }) =>
    DeleteCommentService({ ...input, userId: ctx.user.id, ctx })
  );

export { deleteCommentProcedure };
