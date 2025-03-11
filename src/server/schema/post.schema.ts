import { z } from "zod";

const createPostSchema = z.object({
  title: z.string(),
  content: z.string(),
});

const deletePostSchema = z.object({
  postId: z.string(),
});

type CreatePostInput = z.TypeOf<typeof createPostSchema>;
type DeletePostInput = z.TypeOf<typeof deletePostSchema>;

export { createPostSchema, deletePostSchema };

export type { CreatePostInput, DeletePostInput };
