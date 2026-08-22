import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_getUserPosts } from "../domain/readPosts";
import { readUserPostsOutputSchema, readUserPostsSchema } from "../schema";

const procedure_readUserPosts = publicProcedure
	.input(readUserPostsSchema)
	.output(readUserPostsOutputSchema)
	.query(async ({ input, ctx }) => {
		try {
			return await domain_getUserPosts({ ctx, input });
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

export { procedure_readUserPosts };
