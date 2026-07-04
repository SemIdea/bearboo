import { verifiedProcedure } from "@/server/createRouter";
import { CreatePostService } from "../domain/create";
import { createPostSchema, createPostOutputSchema } from "../schema";

const createPostProcedure = verifiedProcedure
  .input(createPostSchema)
  .output(createPostOutputSchema)
  .mutation(async ({ input, ctx }) =>
    CreatePostService({ ...input, userId: ctx.user.id, ctx })
  );

export { createPostProcedure };
