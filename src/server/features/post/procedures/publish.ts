import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_publishPost } from "../domain/publish";
import { publishPostOutputSchema, publishPostSchema } from "../schema";

const procedure_publishPost = verifiedProcedure
	.input(publishPostSchema)
	.output(publishPostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_publishPost({
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

export { procedure_publishPost };
