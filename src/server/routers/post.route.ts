import { protectedProcedure, t } from "../createRouter";
import { createPostController } from "../features/post/create/controller";
import { deletePostController } from "../features/post/delete/controller";
import { createPostSchema, deletePostSchema } from "../schema/post.schema";

const PostRouter = t.router({
  createPost: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => createPostController({ input, ctx })),
  deletePost: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ input, ctx }) => deletePostController({ input, ctx })),
});

export { PostRouter };
