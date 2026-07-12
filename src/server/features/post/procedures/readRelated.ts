import { publicProcedure } from "@/server/createRouter";
import { domain_readRelatedPosts } from "../domain/readRelated";
import {
	readRelatedPostsOutputSchema,
	readRelatedPostsSchema,
} from "../schema";

const procedure_readRelatedPosts = publicProcedure
	.input(readRelatedPostsSchema)
	.output(readRelatedPostsOutputSchema)
	.query(async ({ input, ctx }) => domain_readRelatedPosts({ ctx, input }));

export { procedure_readRelatedPosts };
