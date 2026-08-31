import { verifiedProcedure } from "@/server/createRouter";
import { domain_publishPost } from "../domain/publish";
import { publishPostOutputSchema, publishPostSchema } from "../schema";

const procedure_publishPost = verifiedProcedure
	.input(publishPostSchema)
	.output(publishPostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_publishPost({
			ctx,
			input: { ...input, role: ctx.user.role, reviewerId: ctx.user.id },
		});
	});

export { procedure_publishPost };
