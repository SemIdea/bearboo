import { publicProcedure } from "@/server/createRouter";
import { domain_createAuthSession } from "../../auth/domain/createAuthSession";
import { domain_loginUser } from "../domain/login";
import { loginUserOutputSchema, loginUserSchema } from "../schema";

const procedure_loginUser = publicProcedure
	.input(loginUserSchema)
	.output(loginUserOutputSchema)
	.mutation(async ({ input, ctx }) => {
		const user = await domain_loginUser({ ctx, input });
		const session = await domain_createAuthSession({
			ctx,
			input: { userId: user.id },
		});

		return {
			...session,
			user,
		};
	});

export { procedure_loginUser };
