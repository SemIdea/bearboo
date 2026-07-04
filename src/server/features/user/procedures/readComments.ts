import { publicProcedure } from "@/server/createRouter";
import { domain_readUserComments } from "../domain/readComments";
import {
  readUserCommentsSchema,
  readUserCommentsOutputSchema
} from "../schema";

const procedure_readUserComments = publicProcedure
  .input(readUserCommentsSchema)
  .output(readUserCommentsOutputSchema)
  .query(async ({ input, ctx }) => domain_readUserComments({ ctx, input }));

export { procedure_readUserComments };
