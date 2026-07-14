import { verifiedProcedure } from "@/server/createRouter";
import { domain_rejectPost } from "../domain/reject";
import { rejectPostOutputSchema, rejectPostSchema } from "../schema";

const procedure_rejectPost = verifiedProcedure
	.input(rejectPostSchema)
	.output(rejectPostOutputSchema)
	.mutation(async ({ input, ctx }) =>
		domain_rejectPost({
			ctx,
			input: { ...input, role: ctx.user.role, reviewerId: ctx.user.id },
		}),
	);

export { procedure_rejectPost };
