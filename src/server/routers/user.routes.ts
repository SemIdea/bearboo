import { publicProcedure, t, verifiedProcedure } from "../createRouter";
import { readUserCommentsController } from "../features/user/comments/controller";
import { readUserPostsController } from "../features/user/posts/controller";
import {
  readUserProfileController,
  updateUserProfileController
} from "../features/user/profile/controller";
import {
  readUserCommentsSchema,
  readUserPostsSchema,
  readUserProfileSchema,
  updateUserProfileSchema
} from "../schema/user.schema";

const UserRouter = t.router({
  read: publicProcedure
    .input(readUserProfileSchema)
    .query(async ({ input, ctx }) => readUserProfileController({ input, ctx })),
  readPosts: publicProcedure
    .input(readUserPostsSchema)
    .query(async ({ input, ctx }) => readUserPostsController({ input, ctx })),
  readComments: publicProcedure
    .input(readUserCommentsSchema)
    .query(async ({ input, ctx }) =>
      readUserCommentsController({ input, ctx })
    ),
  update: verifiedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ input, ctx }) =>
      updateUserProfileController({ input, ctx })
    )
});

export { UserRouter };
