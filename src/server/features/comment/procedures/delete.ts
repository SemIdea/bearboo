import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_deleteComment } from "../domain/delete";
import { deleteCommentOutputSchema, deleteCommentSchema } from "../schema";

const procedure_deleteComment = verifiedProcedure
	.input(deleteCommentSchema)
	.output(deleteCommentOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_deleteComment({
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

export { procedure_deleteComment };
