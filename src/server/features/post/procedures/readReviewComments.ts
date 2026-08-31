import { verifiedProcedure } from "@/server/createRouter";
import { domain_readReviewComments } from "../domain/readReviewComments";
import {
	readReviewCommentsSchema,
	reviewCommentsOutputSchema,
} from "../schema";

const procedure_readReviewComments = verifiedProcedure
	.input(readReviewCommentsSchema)
	.output(reviewCommentsOutputSchema)
	.query(async ({ input, ctx }) => {
		return domain_readReviewComments({
			ctx,
			input: { ...input, userId: ctx.user.id, role: ctx.user.role },
		});
	});

export { procedure_readReviewComments };
