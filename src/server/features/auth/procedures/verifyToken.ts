import { publicProcedure } from "@/server/createRouter";
import { domain_verifyToken } from "../domain/verifyToken";
import { verifyTokenOutputSchema, verifyTokenSchema } from "../schema";

const procedure_verifyToken = publicProcedure
	.input(verifyTokenSchema)
	.output(verifyTokenOutputSchema)
	.mutation(async ({ input, ctx }) => {
		return domain_verifyToken({ ctx, input });
	});

export { procedure_verifyToken };
