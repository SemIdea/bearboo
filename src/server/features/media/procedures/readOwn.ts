import { protectedProcedure } from "@/server/createRouter";
import { domain_readOwnMedia } from "../domain/readOwn";
import { readOwnMediaOutputSchema } from "../schema";

const procedure_readOwnMedia = protectedProcedure
	.output(readOwnMediaOutputSchema)
	.query(async ({ ctx }) =>
		domain_readOwnMedia({
			ctx,
			input: { userId: ctx.user.id, role: ctx.user.role },
		}),
	);

export { procedure_readOwnMedia };
