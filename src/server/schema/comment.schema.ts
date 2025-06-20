import { z } from "zod";

const createCommentschema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Content cannot be empty")
});

const deleteCommentSchema = z.object({
  id: z.string()
});

const findAllCommentsByPostSchema = z.object({
  postId: z.string()
});

type CreateCommentInput = z.TypeOf<typeof createCommentschema>;
type DeleteCommentInput = z.TypeOf<typeof deleteCommentSchema>;
type FindAllCommentsByPostInput = z.TypeOf<typeof findAllCommentsByPostSchema>;

export {
  createCommentschema,
  deleteCommentSchema,
  findAllCommentsByPostSchema
};

export type {
  CreateCommentInput,
  DeleteCommentInput,
  FindAllCommentsByPostInput
};
