import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_readPost } from "../domain/read";
import { readPostOutputSchema, readPostSchema } from "../schema";

const procedure_readPost = publicProcedure
	.input(readPostSchema)
	.output(readPostOutputSchema)
	.query(async ({ input, ctx }) => {
		try {
			return await domain_readPost({ ctx, input });
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

export { procedure_readPost };
