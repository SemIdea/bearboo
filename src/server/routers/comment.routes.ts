import { protectedProcedure, publicProcedure, t } from "../createRouter";
import { createCommentController } from "../features/comment/create/controller";
import { findAllCommentsByPostController } from "../features/comment/find/controller";
import {
  createCommentschema,
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
    )
});

export { CommentRouter };
