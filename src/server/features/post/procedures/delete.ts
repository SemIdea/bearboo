import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_deletePost } from "../domain/delete";
import { deletePostOutputSchema, deletePostSchema } from "../schema";

const procedure_deletePost = verifiedProcedure
	.input(deletePostSchema)
	.output(deletePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_deletePost({
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

export { procedure_deletePost };
