import { publicProcedure } from "@/server/createRouter";
import { ReadPostService } from "../domain/read";
import { readPostSchema, readPostOutputSchema } from "../schema";

const readPostProcedure = publicProcedure
  .input(readPostSchema)
  .output(readPostOutputSchema)
  .query(async ({ input, ctx }) => ReadPostService({ ...input, ctx }));

export { readPostProcedure };
