import { publicProcedure, t, verifiedProcedure } from "../createRouter";
import { createCommentController } from "../features/comment/create/controller";
import { deleteCommentController } from "../features/comment/delete/controller";
import { readAllCommentsByPostController } from "../features/comment/readAll/controller";
import { updateCommentController } from "../features/comment/update/controller";
import {
  createCommentschema,
  readAllCommentsByPostSchema,
  updateCommentSchema,
  deleteCommentSchema
} from "../schema/comment.schema";

const CommentRouter = t.router({
  create: verifiedProcedure
    .input(createCommentschema)
    .mutation(async ({ input, ctx }) =>
      createCommentController({ input, ctx })
    ),
  readAllByPost: publicProcedure
    .input(readAllCommentsByPostSchema)
    .query(async ({ input, ctx }) =>
      readAllCommentsByPostController({ input, ctx })
    ),
  update: verifiedProcedure
    .input(updateCommentSchema)
    .mutation(async ({ input, ctx }) =>
      updateCommentController({ input, ctx })
    ),
  delete: verifiedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ input, ctx }) => deleteCommentController({ input, ctx }))
});

export { CommentRouter };
