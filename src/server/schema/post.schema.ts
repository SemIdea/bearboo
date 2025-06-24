import { z } from "zod";

const createPostSchema = z.object({
  title: z.string(),
  content: z.string()
});

const readPostSchema = z.object({
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

const revalidatePostSchema = z.object({
  postId: z.string()
});

type CreatePostInput = z.TypeOf<typeof createPostSchema>;
type ReadPostInput = z.TypeOf<typeof readPostSchema>;
type UpdatePostInput = z.TypeOf<typeof updatePostSchema>;
type DeletePostInput = z.TypeOf<typeof deletePostSchema>;
type RevalidatePostInput = z.TypeOf<typeof revalidatePostSchema>;

export {
  createPostSchema,
  readPostSchema,
  updatePostSchema,
  deletePostSchema,
  revalidatePostSchema
};

export type {
  CreatePostInput,
  ReadPostInput,
  UpdatePostInput,
  DeletePostInput,
  RevalidatePostInput
};
