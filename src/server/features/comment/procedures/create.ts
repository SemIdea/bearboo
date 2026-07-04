import { verifiedProcedure } from "@/server/createRouter";
import { CreateCommentService } from "../domain/create";
import { createCommentschema, createCommentOutputSchema } from "../schema";

const createCommentProcedure = verifiedProcedure
  .input(createCommentschema)
  .output(createCommentOutputSchema)
  .mutation(async ({ input, ctx }) =>
    CreateCommentService({ ...input, userId: ctx.user.id, ctx })
  );

export { createCommentProcedure };
