import { TRPCError } from "@trpc/server";
import { publicProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_resetPassword } from "../domain/resetPassword";
import { resetPasswordOutputSchema, resetPasswordSchema } from "../schema";

const procedure_resetPassword = publicProcedure
	.input(resetPasswordSchema)
	.output(resetPasswordOutputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			return await domain_resetPassword({
				ctx,
				input: {
					token: input.token,
					newPassword: input.password,
				},
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

export { procedure_resetPassword };
