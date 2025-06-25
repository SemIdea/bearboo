import { publicProcedure, t } from "../createRouter";
import { readUserCommentsController } from "../features/user/comments/controller";
import { getUserPostsController } from "../features/user/posts/controller";
import { readUserProfileController } from "../features/user/profile/controller";
import {
  readUserCommentsSchema,
  readUserPostsSchema,
  readUserProfileSchema
} from "../schema/user.schema";

const UserRouter = t.router({
  profile: publicProcedure
    .input(readUserProfileSchema)
    .query(async ({ input, ctx }) => readUserProfileController({ input, ctx })),
  posts: publicProcedure
    .input(readUserPostsSchema)
    .query(async ({ input, ctx }) => getUserPostsController({ input, ctx })),
  comments: publicProcedure
    .input(readUserCommentsSchema)
    .query(async ({ input, ctx }) => readUserCommentsController({ input, ctx }))
});

export { UserRouter };
