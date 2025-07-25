import { z } from "zod";
import { CommentErrorCode } from "@/shared/error/comment";

const createCommentschema = z.object({
  postId: z.string(),
  content: z
    .string({
      required_error: CommentErrorCode.COMMENT_CONTENT_REQUIRED
    })
    .min(1, CommentErrorCode.COMMENT_CONTENT_TOO_SHORT)
});

const readAllCommentsByPostSchema = z.object({
  postId: z.string()
});

const updateCommentSchema = z.object({
  id: z.string(),
  content: z
    .string({
      required_error: CommentErrorCode.COMMENT_CONTENT_REQUIRED
    })
    .min(1, CommentErrorCode.COMMENT_CONTENT_TOO_SHORT)
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
