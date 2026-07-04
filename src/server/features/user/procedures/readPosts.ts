import { publicProcedure } from "@/server/createRouter";
import { GetUserPostsService } from "../domain/readPosts";
import { readUserPostsSchema, readUserPostsOutputSchema } from "../schema";

const readUserPostsProcedure = publicProcedure
  .input(readUserPostsSchema)
  .output(readUserPostsOutputSchema)
  .query(async ({ input, ctx }) => GetUserPostsService({ ...input, ctx }));

export { readUserPostsProcedure };
