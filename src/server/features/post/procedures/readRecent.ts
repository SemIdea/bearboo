import { publicProcedure } from "@/server/createRouter";
import { domain_readRecentPosts } from "../domain/readRecent";
import { readRecentPostsOutputSchema } from "../schema";

const procedure_readRecentPosts = publicProcedure
  .output(readRecentPostsOutputSchema)
  .query(async ({ ctx }) => domain_readRecentPosts({ ctx, input: {} }));

export { procedure_readRecentPosts };
