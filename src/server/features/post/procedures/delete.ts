import { verifiedProcedure } from "@/server/createRouter";
import { domain_deletePost } from "../domain/delete";
import { deletePostOutputSchema, deletePostSchema } from "../schema";

const procedure_deletePost = verifiedProcedure
	.input(deletePostSchema)
	.output(deletePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_deletePost({
			ctx,
			input: { ...input, userId: ctx.user.id, role: ctx.user.role },
		});
	});

export { procedure_deletePost };
