import { publicProcedure } from "@/server/createRouter";
import { domain_resetPassword } from "../domain/resetPassword";
import { resetPasswordOutputSchema, resetPasswordSchema } from "../schema";

const procedure_resetPassword = publicProcedure
	.input(resetPasswordSchema)
	.output(resetPasswordOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_resetPassword({
			ctx,
			input: {
				token: input.token,
				newPassword: input.password,
			},
		});
	});

export { procedure_resetPassword };
