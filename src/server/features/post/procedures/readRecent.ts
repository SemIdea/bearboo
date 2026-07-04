import { publicProcedure } from "@/server/createRouter";
import { ReadRecentPostsService } from "../domain/readRecent";
import { readRecentPostsOutputSchema } from "../schema";

const readRecentPostsProcedure = publicProcedure
  .output(readRecentPostsOutputSchema)
  .query(async ({ ctx }) => ReadRecentPostsService({ ctx }));

export { readRecentPostsProcedure };
