import { z } from "zod";
import { PostErrorCode } from "@/shared/error/post";

const createPostSchema = z.object({
  title: z
    .string({
      required_error: PostErrorCode.POST_TITLE_REQUIRED
    })
    .min(3, PostErrorCode.POST_TITLE_TOO_SHORT),
  content: z
    .string({
      required_error: PostErrorCode.POST_CONTENT_REQUIRED
    })
    .min(10, PostErrorCode.POST_CONTENT_TOO_SHORT)
});

const readPostSchema = z.object({
  id: z.string()
});

const updatePostSchema = z.object({
  id: z.string(),
  title: z.string().min(3, PostErrorCode.POST_TITLE_TOO_SHORT).optional(),
  content: z.string().min(10, PostErrorCode.POST_CONTENT_TOO_SHORT).optional()
});

const deletePostSchema = z.object({
  id: z.string()
});

const revalidatePostSchema = z.object({
  id: z.string()
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
