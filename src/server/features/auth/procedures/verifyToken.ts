import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_verifyToken } from "../domain/verifyToken";
import { verifyTokenOutputSchema, verifyTokenSchema } from "../schema";

const procedure_verifyToken = publicProcedure
	.input(verifyTokenSchema)
	.output(verifyTokenOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_verifyToken({ ctx, input });
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

export { procedure_verifyToken };
