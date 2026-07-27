import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_archivePost } from "../domain/archive";
import { archivePostOutputSchema, archivePostSchema } from "../schema";

const procedure_archivePost = verifiedProcedure
	.input(archivePostSchema)
	.output(archivePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_archivePost({
				ctx,
				input: { ...input, role: ctx.user.role },
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

export { procedure_archivePost };
