import { z } from "zod";

const createCommentschema = z.object({
  postId: z.string(),
  content: z.string().min(1, "Content cannot be empty")
});

const findAllCommentsByPostSchema = z.object({
  postId: z.string()
});

type CreateCommentInput = z.TypeOf<typeof createCommentschema>;
type FindAllCommentsByPostInput = z.TypeOf<typeof findAllCommentsByPostSchema>;

export { createCommentschema, findAllCommentsByPostSchema };

export type { CreateCommentInput, FindAllCommentsByPostInput };
