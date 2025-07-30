import { publicProcedure, t, verifiedProcedure } from "../createRouter";
import { createPostController } from "../features/post/create/controller";
import { deletePostController } from "../features/post/delete/controller";
import {
  createPostSchema,
  deletePostSchema,
  readPostSchema,
  revalidatePostSchema,
  updatePostSchema
} from "../schema/post.schema";
import { readPostController } from "../features/post/read/controller";
import { updatePostController } from "../features/post/update/controller";
import { revalidatePostController } from "../features/post/revalidate/controller";
import { readRecentPostsController } from "../features/post/readRecent/controller";

const PostRouter = t.router({
  create: verifiedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => createPostController({ input, ctx })),
  read: publicProcedure
    .input(readPostSchema)
    .query(async ({ input, ctx }) => readPostController({ input, ctx })),
  readRecent: publicProcedure.query(async ({ ctx }) =>
    readRecentPostsController({ ctx })
  ),
  update: verifiedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => updatePostController({ input, ctx })),
  revalidate: verifiedProcedure
    .input(revalidatePostSchema)
    .mutation(async ({ input, ctx }) =>
      revalidatePostController({ input, ctx })
    ),
  delete: verifiedProcedure
    .input(deletePostSchema)
    .mutation(async ({ input, ctx }) => deletePostController({ input, ctx }))
});

export { PostRouter };
