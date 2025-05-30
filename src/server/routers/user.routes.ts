import { publicProcedure, t } from "../createRouter";
import { getUserProfileController } from "../features/user/profile/controller";
import { getUserProfileSchema } from "../schema/user.schema";

const UserRouter = t.router({
  profile: publicProcedure
    .input(getUserProfileSchema)
    .query(async ({ input, ctx }) => getUserProfileController({ input, ctx })),
});

export { UserRouter };
