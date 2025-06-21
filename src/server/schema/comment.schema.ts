import { z } from "zod";

const createCommentschema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Content cannot be empty")
});

const findAllCommentsByPostSchema = z.object({
  postId: z.string()
});

const deleteCommentSchema = z.object({
  id: z.string()
});

type CreateCommentInput = z.TypeOf<typeof createCommentschema>;
type FindAllCommentsByPostInput = z.TypeOf<typeof findAllCommentsByPostSchema>;
type DeleteCommentInput = z.TypeOf<typeof deleteCommentSchema>;

export {
  createCommentschema,
  findAllCommentsByPostSchema,
  deleteCommentSchema
};

export type {
  CreateCommentInput,
  FindAllCommentsByPostInput,
  DeleteCommentInput
};
