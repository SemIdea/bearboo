import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_readReviewComments } from "../domain/readReviewComments";
import {
	readReviewCommentsSchema,
	reviewCommentsOutputSchema,
} from "../schema";

const procedure_readReviewComments = verifiedProcedure
	.input(readReviewCommentsSchema)
	.output(reviewCommentsOutputSchema)
	.query(async ({ input, ctx }) => {
		try {
			return await domain_readReviewComments({
				ctx,
				input: { ...input, userId: ctx.user.id, role: ctx.user.role },
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

export { procedure_readReviewComments };
