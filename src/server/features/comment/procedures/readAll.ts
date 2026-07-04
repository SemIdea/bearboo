import { publicProcedure } from "@/server/createRouter";
import { domain_readAllCommentsByPost } from "../domain/readAll";
import {
  readAllCommentsByPostSchema,
  readAllCommentsByPostOutputSchema
} from "../schema";

const procedure_readAllCommentsByPost = publicProcedure
  .input(readAllCommentsByPostSchema)
  .output(readAllCommentsByPostOutputSchema)
  .query(async ({ input, ctx }) => domain_readAllCommentsByPost({ ctx, input }));

export { procedure_readAllCommentsByPost };
