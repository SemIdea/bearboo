import { publicProcedure, t, verifiedProcedure } from "../../createRouter";
import { createCommentController } from "./procedures/create";
import { deleteCommentController } from "./procedures/delete";
import { readAllCommentsByPostController } from "./procedures/readAll";
import { updateCommentController } from "./procedures/update";
import {
  createCommentschema,
  readAllCommentsByPostSchema,
  updateCommentSchema,
  deleteCommentSchema
} from "./schema";

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
