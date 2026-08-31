import { verifiedProcedure } from "@/server/createRouter";
import { domain_updatePost } from "../domain/update";
import { updatePostOutputSchema, updatePostSchema } from "../schema";

const procedure_updatePost = verifiedProcedure
	.input(updatePostSchema)
	.output(updatePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_updatePost({
			ctx,
			input: { ...input, userId: ctx.user.id, role: ctx.user.role },
		});
	});

export { procedure_updatePost };
