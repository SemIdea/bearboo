import { verifiedProcedure } from "@/server/createRouter";
import { domain_createComment } from "../domain/create";
import { createCommentschema, createCommentOutputSchema } from "../schema";

const procedure_createComment = verifiedProcedure
  .input(createCommentschema)
  .output(createCommentOutputSchema)
  .mutation(async ({ input, ctx }) =>
    domain_createComment({ ctx, input: { ...input, userId: ctx.user.id } })
  );

export { procedure_createComment };
