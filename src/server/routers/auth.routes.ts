import { protectedProcedure, t } from "../createRouter";
import { registerUserController } from "../features/user/register/controller";
import { createUserSchema } from "../schema/user.schema";

const authRoter = t.router({
  registerUser: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => registerUserController({ input })),
});

export { authRoter };
