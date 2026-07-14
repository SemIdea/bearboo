import { publicProcedure } from "@/server/createRouter";
import { domain_searchPosts } from "../domain/search";
import { searchPostsOutputSchema, searchPostsSchema } from "../schema";

const procedure_searchPosts = publicProcedure
	.input(searchPostsSchema)
	.output(searchPostsOutputSchema)
	.query(async ({ ctx, input }) => domain_searchPosts({ ctx, input }));

export { procedure_searchPosts };
