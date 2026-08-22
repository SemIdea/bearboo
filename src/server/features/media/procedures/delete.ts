import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_deleteMedia } from "../domain/delete";
import { deleteMediaOutputSchema, deleteMediaSchema } from "../schema";

const procedure_deleteMedia = protectedProcedure
	.input(deleteMediaSchema)
	.output(deleteMediaOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			const success = await domain_deleteMedia({
				ctx,
				input: { ...input, userId: ctx.user.id, role: ctx.user.role },
			});

			return { success };
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

export { procedure_deleteMedia };
