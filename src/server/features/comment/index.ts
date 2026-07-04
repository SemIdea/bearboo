import { publicProcedure, t, verifiedProcedure } from "../../createRouter";
import { createCommentController } from "./procedures/create";
import { deleteCommentController } from "./procedures/delete";
import { readAllCommentsByPostController } from "./procedures/readAll";
import { updateCommentController } from "./procedures/update";
import {
  createCommentschema,
  readAllCommentsByPostSchema,
  updateCommentSchema,
  deleteCommentSchema,
  createCommentOutputSchema,
  readAllCommentsByPostOutputSchema,
  updateCommentOutputSchema,
  deleteCommentOutputSchema
} from "./schema";

const CommentRouter = t.router({
  create: verifiedProcedure
    .input(createCommentschema)
    .output(createCommentOutputSchema)
    .mutation(async ({ input, ctx }) =>
      createCommentController({ input, ctx })
    ),
  readAllByPost: publicProcedure
    .input(readAllCommentsByPostSchema)
    .output(readAllCommentsByPostOutputSchema)
    .query(async ({ input, ctx }) =>
      readAllCommentsByPostController({ input, ctx })
    ),
  update: verifiedProcedure
    .input(updateCommentSchema)
    .output(updateCommentOutputSchema)
    .mutation(async ({ input, ctx }) =>
      updateCommentController({ input, ctx })
    ),
  delete: verifiedProcedure
    .input(deleteCommentSchema)
    .output(deleteCommentOutputSchema)
    .mutation(async ({ input, ctx }) => deleteCommentController({ input, ctx }))
});

export { CommentRouter };
