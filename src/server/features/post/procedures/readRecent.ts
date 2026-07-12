import { publicProcedure } from "@/server/createRouter";
import { domain_readRecentPosts } from "../domain/readRecent";
import { readRecentPostsOutputSchema, readRecentPostsSchema } from "../schema";

const procedure_readRecentPosts = publicProcedure
	.input(readRecentPostsSchema)
	.output(readRecentPostsOutputSchema)
	.query(async ({ ctx, input }) =>
		domain_readRecentPosts({ ctx, input: input ?? {} }),
	);

export { procedure_readRecentPosts };
