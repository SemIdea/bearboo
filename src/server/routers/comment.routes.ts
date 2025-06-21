import { protectedProcedure, publicProcedure, t } from "../createRouter";
import { createCommentController } from "../features/comment/create/controller";
import { deleteCommentController } from "../features/comment/delete/controller";
import { findAllCommentsByPostController } from "../features/comment/find/controller";
import {
  createCommentschema,
  deleteCommentSchema,
  findAllCommentsByPostSchema
} from "../schema/comment.schema";

const CommentRouter = t.router({
  createComment: protectedProcedure
    .input(createCommentschema)
    .mutation(async ({ input, ctx }) =>
      createCommentController({ input, ctx })
    ),
  findAllCommentsByPost: publicProcedure
    .input(findAllCommentsByPostSchema)
    .query(async ({ input, ctx }) =>
      findAllCommentsByPostController({ input, ctx })
    ),
  deleteComment: protectedProcedure
    .input(deleteCommentSchema)
    .mutation(async ({ input, ctx }) => deleteCommentController({ input, ctx }))
});

export { CommentRouter };
