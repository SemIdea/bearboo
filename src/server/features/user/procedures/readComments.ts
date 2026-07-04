import { publicProcedure } from "@/server/createRouter";
import { ReadUserCommentsService } from "../domain/readComments";
import {
  readUserCommentsSchema,
  readUserCommentsOutputSchema
} from "../schema";

const readUserCommentsProcedure = publicProcedure
  .input(readUserCommentsSchema)
  .output(readUserCommentsOutputSchema)
  .query(async ({ input, ctx }) => ReadUserCommentsService({ ...input, ctx }));

export { readUserCommentsProcedure };
