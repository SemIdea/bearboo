import { verifiedProcedure } from "@/server/createRouter";
import { DeletePostService } from "../domain/delete";
import { deletePostSchema, deletePostOutputSchema } from "../schema";

const deletePostProcedure = verifiedProcedure
  .input(deletePostSchema)
  .output(deletePostOutputSchema)
  .mutation(async ({ input, ctx }) =>
    DeletePostService({ ...input, userId: ctx.user.id, ctx })
  );

export { deletePostProcedure };
