import { z } from "zod";

const createCommentschema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Content cannot be empty")
});

const findAllCommentsByPostSchema = z.object({
  postId: z.string()
});

const updateCommentSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "Content cannot be empty")
});

const deleteCommentSchema = z.object({
  id: z.string()
});

type CreateCommentInput = z.TypeOf<typeof createCommentschema>;
type FindAllCommentsByPostInput = z.TypeOf<typeof findAllCommentsByPostSchema>;
type UpdateCommentInput = z.TypeOf<typeof updateCommentSchema>;
type DeleteCommentInput = z.TypeOf<typeof deleteCommentSchema>;

export {
  createCommentschema,
  findAllCommentsByPostSchema,
  updateCommentSchema,
  deleteCommentSchema
};

export type {
  CreateCommentInput,
  FindAllCommentsByPostInput,
  UpdateCommentInput,
  DeleteCommentInput
};
