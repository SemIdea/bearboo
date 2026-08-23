import { verifiedProcedure } from "@/server/createRouter";
import { domain_submitForReviewPost } from "../domain/submitForReview";
import {
	submitForReviewPostOutputSchema,
	submitForReviewPostSchema,
} from "../schema";

const procedure_submitForReviewPost = verifiedProcedure
	.input(submitForReviewPostSchema)
	.output(submitForReviewPostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_submitForReviewPost({
			ctx,
			input: { ...input, userId: ctx.user.id },
		});
	});

export { procedure_submitForReviewPost };
