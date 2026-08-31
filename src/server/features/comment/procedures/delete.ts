import { verifiedProcedure } from "@/server/createRouter";
import { domain_deleteComment } from "../domain/delete";
import { deleteCommentOutputSchema, deleteCommentSchema } from "../schema";

const procedure_deleteComment = verifiedProcedure
	.input(deleteCommentSchema)
	.output(deleteCommentOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_deleteComment({
			ctx,
			input: { ...input, userId: ctx.user.id },
		});
	});

export { procedure_deleteComment };
