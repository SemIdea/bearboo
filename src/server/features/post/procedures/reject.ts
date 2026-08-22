import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_rejectPost } from "../domain/reject";
import { rejectPostOutputSchema, rejectPostSchema } from "../schema";

const procedure_rejectPost = verifiedProcedure
	.input(rejectPostSchema)
	.output(rejectPostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_rejectPost({
				ctx,
				input: { ...input, role: ctx.user.role, reviewerId: ctx.user.id },
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

export { procedure_rejectPost };
