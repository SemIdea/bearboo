import { publicProcedure } from "@/server/createRouter";
import { ReadAllCommentsByPostService } from "../domain/readAll";
import {
  readAllCommentsByPostSchema,
  readAllCommentsByPostOutputSchema
} from "../schema";

const readAllCommentsByPostProcedure = publicProcedure
  .input(readAllCommentsByPostSchema)
  .output(readAllCommentsByPostOutputSchema)
  .query(async ({ input, ctx }) =>
    ReadAllCommentsByPostService({ ...input, ctx })
  );

export { readAllCommentsByPostProcedure };
