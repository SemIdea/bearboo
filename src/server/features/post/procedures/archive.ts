import { verifiedProcedure } from "@/server/createRouter";
import { domain_archivePost } from "../domain/archive";
import { archivePostOutputSchema, archivePostSchema } from "../schema";

const procedure_archivePost = verifiedProcedure
	.input(archivePostSchema)
	.output(archivePostOutputSchema)
	.mutation(async ({ input, ctx }) =>
		domain_archivePost({
			ctx,
			input: { ...input, role: ctx.user.role },
		}),
	);

export { procedure_archivePost };
