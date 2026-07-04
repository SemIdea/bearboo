import { publicProcedure, t, verifiedProcedure } from "../../createRouter";
import { readUserCommentsController } from "./procedures/readComments";
import { readUserPostsController } from "./procedures/readPosts";
import { readUserProfileController } from "./procedures/readProfile";
import { updateUserProfileController } from "./procedures/updateProfile";
import { loginUserController } from "./procedures/login";
import { registerUserController } from "./procedures/register";
import {
  readUserCommentsSchema,
  readUserPostsSchema,
  readUserProfileSchema,
  updateUserProfileSchema,
  loginUserSchema,
  registerUserSchema,
  readUserCommentsOutputSchema,
  readUserPostsOutputSchema,
  readUserProfileOutputSchema,
  updateUserProfileOutputSchema,
  loginUserOutputSchema,
  registerUserOutputSchema
} from "./schema";

const UserRouter = t.router({
  read: publicProcedure
    .input(readUserProfileSchema)
    .output(readUserProfileOutputSchema)
    .query(async ({ input, ctx }) => readUserProfileController({ input, ctx })),
  readPosts: publicProcedure
    .input(readUserPostsSchema)
    .output(readUserPostsOutputSchema)
    .query(async ({ input, ctx }) => readUserPostsController({ input, ctx })),
  readComments: publicProcedure
    .input(readUserCommentsSchema)
    .output(readUserCommentsOutputSchema)
    .query(async ({ input, ctx }) =>
      readUserCommentsController({ input, ctx })
    ),
  update: verifiedProcedure
    .input(updateUserProfileSchema)
    .output(updateUserProfileOutputSchema)
    .mutation(async ({ input, ctx }) =>
      updateUserProfileController({ input, ctx })
    ),
  login: publicProcedure
    .input(loginUserSchema)
    .output(loginUserOutputSchema)
    .mutation(async ({ input, ctx }) => loginUserController({ input, ctx })),
  register: publicProcedure
    .input(registerUserSchema)
    .output(registerUserOutputSchema)
    .mutation(async ({ input, ctx }) => registerUserController({ input, ctx }))
});

export { UserRouter };
