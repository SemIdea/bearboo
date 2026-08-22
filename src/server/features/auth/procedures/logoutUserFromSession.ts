import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/server/createRouter";
import { DomainError } from "@/shared/error/domainError";
import { domain_deleteSession } from "../domain/deleteSession";
import { logoutUserFromSessionOutputSchema } from "../schema";

const procedure_logoutUserFromSession = protectedProcedure
	.output(logoutUserFromSessionOutputSchema)
	.mutation(async ({ ctx }) => {
		const session = ctx.user.session;

		try {
			await domain_deleteSession({
				ctx,
				input: {
					id: session.id,
					userId: ctx.user.id,
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

		ctx.resCookies.clear("accessToken");
		ctx.resCookies.clear("refreshToken");
	});

export { procedure_logoutUserFromSession };
