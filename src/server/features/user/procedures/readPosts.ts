import { publicProcedure } from "@/server/createRouter";
import { domain_getUserPosts } from "../domain/readPosts";
import { readUserPostsSchema, readUserPostsOutputSchema } from "../schema";

const procedure_readUserPosts = publicProcedure
  .input(readUserPostsSchema)
  .output(readUserPostsOutputSchema)
  .query(async ({ input, ctx }) => domain_getUserPosts({ ctx, input }));

export { procedure_readUserPosts };
