import { verifiedProcedure } from "@/server/createRouter";
import { domain_revalidatePost } from "../domain/revalidate";
import { revalidatePostOutputSchema, revalidatePostSchema } from "../schema";

const procedure_revalidatePost = verifiedProcedure
	.input(revalidatePostSchema)
	.output(revalidatePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_revalidatePost({
			ctx,
			input: { ...input, userId: ctx.user.id },
		});
	});

export { procedure_revalidatePost };
