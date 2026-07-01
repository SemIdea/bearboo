import { publicProcedure, t, verifiedProcedure } from "../../createRouter";
import { createPostController } from "./procedures/create";
import { deletePostController } from "./procedures/delete";
import {
  createPostSchema,
  deletePostSchema,
  readPostSchema,
  revalidatePostSchema,
  updatePostSchema
} from "./schema";
import { readPostController } from "./procedures/read";
import { updatePostController } from "./procedures/update";
import { revalidatePostController } from "./procedures/revalidate";
import { readRecentPostsController } from "./procedures/readRecent";

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
