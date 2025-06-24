import { protectedProcedure, publicProcedure, t } from "../createRouter";
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
import { readAllPostsController } from "../features/post/readAll/controller";
import { revalidatePostController } from "../features/post/revalidate/controller";

const PostRouter = t.router({
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => createPostController({ input, ctx })),
  readPost: publicProcedure
    .input(readPostSchema)
    .query(async ({ input, ctx }) => readPostController({ input, ctx })),
  readAllPosts: publicProcedure.query(async ({ ctx }) =>
    readAllPostsController({ ctx })
  ),
  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => updatePostController({ input, ctx })),
  revalidatePost: protectedProcedure
    .input(revalidatePostSchema)
    .mutation(async ({ input, ctx }) =>
      revalidatePostController({ input, ctx })
    ),
  deletePost: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ input, ctx }) => deletePostController({ input, ctx }))
});

export { PostRouter };
