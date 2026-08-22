import { TRPCError } from "@trpc/server";
import { verifiedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_revalidatePost } from "../domain/revalidate";
import { revalidatePostOutputSchema, revalidatePostSchema } from "../schema";

const procedure_revalidatePost = verifiedProcedure
	.input(revalidatePostSchema)
	.output(revalidatePostOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_revalidatePost({
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

export { procedure_revalidatePost };
