import { t } from "../../createRouter";
import { procedure_createComment } from "./procedures/create";
import { procedure_deleteComment } from "./procedures/delete";
import { procedure_readAllCommentsByPost } from "./procedures/readAll";
import { procedure_updateComment } from "./procedures/update";

const CommentRouter = t.router({
	create: procedure_createComment,
	readAllByPost: procedure_readAllCommentsByPost,
	update: procedure_updateComment,
	delete: procedure_deleteComment,
});

export { CommentRouter };
