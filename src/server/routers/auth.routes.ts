import { publicProcedure, t } from "../createRouter";
import { registerUserController } from "../features/user/register/controller";
import { createUserSchema } from "../schema/user.schema";

const authRoter = t.router({
  registerUser: t.procedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => registerUserController({ input, ctx })),
  test: publicProcedure.query(async () => "Hello, World!"),
});

export default authRoter;
