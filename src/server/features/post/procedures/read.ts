import { publicProcedure } from "@/server/createRouter";
import { domain_readPost } from "../domain/read";
import { readPostOutputSchema, readPostSchema } from "../schema";

const procedure_readPost = publicProcedure
	.input(readPostSchema)
	.output(readPostOutputSchema)
	.query(async ({ input, ctx }) => {
		return domain_readPost({ ctx, input });
	});

export { procedure_readPost };
