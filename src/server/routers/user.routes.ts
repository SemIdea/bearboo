import { publicProcedure, t } from "../createRouter";
import { getUserPostsController } from "../features/user/posts/controller";
import { getUserProfileController } from "../features/user/profile/controller";
import {
  getUserPostsSchema,
  getUserProfileSchema
} from "../schema/user.schema";

const UserRouter = t.router({
  profile: publicProcedure
    .input(getUserProfileSchema)
    .query(async ({ input, ctx }) => getUserProfileController({ input, ctx })),
  posts: publicProcedure
    .input(getUserPostsSchema)
    .query(async ({ input, ctx }) => getUserPostsController({ input, ctx }))
});

export { UserRouter };
