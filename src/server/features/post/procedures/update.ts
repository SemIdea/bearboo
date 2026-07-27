import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_updatePost } from "../domain/update";
import { updatePostOutputSchema, updatePostSchema } from "../schema";

const procedure_updatePost = verifiedProcedure
	.input(updatePostSchema)
	.output(updatePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_updatePost({
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

export { procedure_updatePost };
