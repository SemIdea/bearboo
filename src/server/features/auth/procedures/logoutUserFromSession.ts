import { protectedProcedure } from "@/server/createRouter";
import { domain_deleteSession } from "../domain/deleteSession";
import { logoutUserFromSessionOutputSchema } from "../schema";

const procedure_logoutUserFromSession = protectedProcedure
	.output(logoutUserFromSessionOutputSchema)
	.mutation(async ({ ctx }) => {
		const session = ctx.user.session;

		await domain_deleteSession({
			ctx,
			input: {
				id: session.id,
				userId: ctx.user.id,
			},
		});

		ctx.resCookies.clear("accessToken");
		ctx.resCookies.clear("refreshToken");
	});

export { procedure_logoutUserFromSession };
