import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_submitForReviewPost } from "../domain/submitForReview";
import {
	submitForReviewPostOutputSchema,
	submitForReviewPostSchema,
} from "../schema";

const procedure_submitForReviewPost = verifiedProcedure
	.input(submitForReviewPostSchema)
	.output(submitForReviewPostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_submitForReviewPost({
				ctx,
				input: { ...input, userId: ctx.user.id },
			});
		} catch (error) {
			if (error instanceof DomainError) {
				throw new TRPCError({
					code: error.httpCode,
					message: error.message,
					cause: error,
				});
			}

			throw error;
		}
	});

export { procedure_submitForReviewPost };
