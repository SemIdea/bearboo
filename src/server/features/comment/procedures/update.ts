import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_updateComment } from "../domain/update";
import { updateCommentOutputSchema, updateCommentSchema } from "../schema";

const procedure_updateComment = verifiedProcedure
	.input(updateCommentSchema)
	.output(updateCommentOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_updateComment({
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

export { procedure_updateComment };
