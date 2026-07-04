import { verifiedProcedure } from "@/server/createRouter";
import { domain_updatePost } from "../domain/update";
import { updatePostSchema, updatePostOutputSchema } from "../schema";

const procedure_updatePost = verifiedProcedure
  .input(updatePostSchema)
  .output(updatePostOutputSchema)
  .mutation(async ({ input, ctx }) =>
    domain_updatePost({ ctx, input: { ...input, userId: ctx.user.id } })
  );

export { procedure_updatePost };
