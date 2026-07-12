import { protectedProcedure } from "@/server/createRouter";
import { readUserFromSessionOutputSchema } from "../schema";

const procedure_readUserFromSession = protectedProcedure
	.output(readUserFromSessionOutputSchema)
	.query(async ({ ctx }) => ({ user: ctx.user }));

export { procedure_readUserFromSession };
