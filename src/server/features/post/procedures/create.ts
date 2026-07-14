import { verifiedProcedure } from "@/server/createRouter";
import { domain_createPost } from "../domain/create";
import { createPostOutputSchema, createPostSchema } from "../schema";

const procedure_createPost = verifiedProcedure
	.input(createPostSchema)
	.output(createPostOutputSchema)
	.mutation(async ({ input, ctx }) =>
		domain_createPost({
			ctx,
			input: { ...input, userId: ctx.user.id, role: ctx.user.role },
		}),
	);

export { procedure_createPost };
