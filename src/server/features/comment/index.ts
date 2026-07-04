import { t } from "../../createRouter";
import { createCommentProcedure } from "./procedures/create";
import { deleteCommentProcedure } from "./procedures/delete";
import { readAllCommentsByPostProcedure } from "./procedures/readAll";
import { updateCommentProcedure } from "./procedures/update";

const CommentRouter = t.router({
  create: createCommentProcedure,
  readAllByPost: readAllCommentsByPostProcedure,
  update: updateCommentProcedure,
  delete: deleteCommentProcedure
});

export { CommentRouter };
