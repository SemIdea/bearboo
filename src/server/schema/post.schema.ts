import { z } from "zod";

const createPostInput = z.object({
  title: z.string(),
  content: z.string(),
});

type CreatePostInput = z.TypeOf<typeof createPostInput>;

export { createPostInput };

export type { CreatePostInput };
