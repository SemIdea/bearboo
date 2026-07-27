import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_readPostBySlug } from "../domain/readBySlug";
import { readPostBySlugOutputSchema, readPostBySlugSchema } from "../schema";

const procedure_readPostBySlug = publicProcedure
	.input(readPostBySlugSchema)
	.output(readPostBySlugOutputSchema)
	.query(async ({ input, ctx }) => {
		try {
			return await domain_readPostBySlug({
				ctx,
				input: { ...input, callerId: ctx.user?.id, role: ctx.user?.role },
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

export { procedure_readPostBySlug };
