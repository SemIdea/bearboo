import { publicProcedure, t } from "../createRouter";
import { getUserCommentsController } from "../features/user/comments/controller";
import { getUserPostsController } from "../features/user/posts/controller";
import { getUserProfileController } from "../features/user/profile/controller";
import {
  readUserCommentsSchema,
  readUserPostsSchema,
  readUserProfileSchema
} from "../schema/user.schema";

const UserRouter = t.router({
  profile: publicProcedure
    .input(readUserProfileSchema)
    .query(async ({ input, ctx }) => getUserProfileController({ input, ctx })),
  posts: publicProcedure
    .input(readUserPostsSchema)
    .query(async ({ input, ctx }) => getUserPostsController({ input, ctx })),
  comments: publicProcedure
    .input(readUserCommentsSchema)
    .query(async ({ input, ctx }) => getUserCommentsController({ input, ctx }))
});

export { UserRouter };
