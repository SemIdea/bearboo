import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_readUserComments } from "../domain/readComments";
import {
	readUserCommentsOutputSchema,
	readUserCommentsSchema,
} from "../schema";

const procedure_readUserComments = publicProcedure
	.input(readUserCommentsSchema)
	.output(readUserCommentsOutputSchema)
	.query(async ({ input, ctx }) => {
		try {
			return await domain_readUserComments({ ctx, input });
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

export { procedure_readUserComments };
