import { publicProcedure } from "@/server/createRouter";
import { domain_readPost } from "../domain/read";
import { readPostSchema, readPostOutputSchema } from "../schema";

const procedure_readPost = publicProcedure
  .input(readPostSchema)
  .output(readPostOutputSchema)
  .query(async ({ input, ctx }) => domain_readPost({ ctx, input }));

export { procedure_readPost };
