import { protectedProcedure, publicProcedure, t } from "../createRouter";
import { createPostController } from "../features/post/create/controller";
import { deletePostController } from "../features/post/delete/controller";
import {
  createPostSchema,
  deletePostSchema,
  findPostSchema,
  updatePostSchema,
} from "../schema/post.schema";
import { findPostController } from "../features/post/find/controller";
import { updatePostController } from "../features/post/update/controller";
import { findAllPostsController } from "../features/post/findAll/controller";

const PostRouter = t.router({
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => createPostController({ input, ctx })),
  findPost: publicProcedure
    .input(findPostSchema)
    .query(async ({ input, ctx }) => findPostController({ input, ctx })),
  findAllPost: publicProcedure.query(async ({ ctx }) =>
    findAllPostsController({ ctx })
  ),
  updatePost: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ input, ctx }) => updatePostController({ input, ctx })),
  deletePost: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ input, ctx }) => deletePostController({ input, ctx })),
});

export { PostRouter };
