import { z } from "zod";

const createPostSchema = z.object({
  title: z.string(),
  content: z.string()
});

const findPostSchema = z.object({
  postId: z.string()
});

const updatePostSchema = z.object({
  postId: z.string(),
  title: z.string().optional(),
  content: z.string().optional()
});

const deletePostSchema = z.object({
  postId: z.string()
});

type CreatePostInput = z.TypeOf<typeof createPostSchema>;
type FindPostInput = z.TypeOf<typeof findPostSchema>;
type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;
type DeletePostInput = z.TypeOf<typeof deletePostSchema>;

export { createPostSchema, findPostSchema, updatePostSchema, deletePostSchema };

export type {
  CreatePostInput,
  FindPostInput,
  UpdatePostInput,
  DeletePostInput
};
