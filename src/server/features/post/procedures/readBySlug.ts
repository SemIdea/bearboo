import { publicProcedure } from "@/server/createRouter";
import { domain_readPostBySlug } from "../domain/readBySlug";
import { readPostBySlugOutputSchema, readPostBySlugSchema } from "../schema";

const procedure_readPostBySlug = publicProcedure
	.input(readPostBySlugSchema)
	.output(readPostBySlugOutputSchema)
	.query(async ({ input, ctx }) =>
		domain_readPostBySlug({
			ctx,
			input: { ...input, callerId: ctx.user?.id, role: ctx.user?.role },
		}),
	);

export { procedure_readPostBySlug };
