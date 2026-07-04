import { publicProcedure, t, verifiedProcedure } from "../../createRouter";
import { createPostController } from "./procedures/create";
import { deletePostController } from "./procedures/delete";
import {
  createPostSchema,
  deletePostSchema,
  readPostSchema,
  revalidatePostSchema,
  updatePostSchema,
  createPostOutputSchema,
  deletePostOutputSchema,
  readPostOutputSchema,
  revalidatePostOutputSchema,
  updatePostOutputSchema,
  readRecentPostsOutputSchema
} from "./schema";
import { readPostController } from "./procedures/read";
import { updatePostController } from "./procedures/update";
import { revalidatePostController } from "./procedures/revalidate";
import { readRecentPostsController } from "./procedures/readRecent";

const PostRouter = t.router({
  create: verifiedProcedure
    .input(createPostSchema)
    .output(createPostOutputSchema)
    .mutation(async ({ input, ctx }) => createPostController({ input, ctx })),
  read: publicProcedure
    .input(readPostSchema)
    .output(readPostOutputSchema)
    .query(async ({ input, ctx }) => readPostController({ input, ctx })),
  readRecent: publicProcedure
    .output(readRecentPostsOutputSchema)
    .query(async ({ ctx }) => readRecentPostsController({ ctx })),
  update: verifiedProcedure
    .input(updatePostSchema)
    .output(updatePostOutputSchema)
    .mutation(async ({ input, ctx }) => updatePostController({ input, ctx })),
  revalidate: verifiedProcedure
    .input(revalidatePostSchema)
    .output(revalidatePostOutputSchema)
    .mutation(async ({ input, ctx }) =>
      revalidatePostController({ input, ctx })
    ),
  delete: verifiedProcedure
    .input(deletePostSchema)
    .output(deletePostOutputSchema)
    .mutation(async ({ input, ctx }) => deletePostController({ input, ctx }))
});

export { PostRouter };
