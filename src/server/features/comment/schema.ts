import { z } from "zod";

const createCommentschema = z.object({
  postId: z.string(),
  content: z
    .string()
    .min(10, "Comment must be at least 10 characters long.")
    .max(500, "Comment must not exceed 500 characters.")
});

const readAllCommentsByPostSchema = z.object({
  postId: z.string()
});

const updateCommentSchema = z.object({
  id: z.string(),
  content: z
    .string()
    .min(10, "Comment must be at least 10 characters long.")
    .max(500, "Comment must not exceed 500 characters.")
});

const deleteCommentSchema = z.object({
  id: z.string()
});

type CreateCommentInput = z.TypeOf<typeof createCommentschema>;
type ReadAllCommentsByPostInput = z.TypeOf<typeof readAllCommentsByPostSchema>;
type UpdateCommentInput = z.TypeOf<typeof updateCommentSchema>;
type DeleteCommentInput = z.TypeOf<typeof deleteCommentSchema>;

export {
  createCommentschema,
  readAllCommentsByPostSchema,
  updateCommentSchema,
  deleteCommentSchema
};

export type {
  CreateCommentInput,
  ReadAllCommentsByPostInput,
  UpdateCommentInput,
  DeleteCommentInput
};
