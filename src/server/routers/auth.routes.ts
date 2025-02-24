import { publicProcedure, t } from "../createRouter";
import { refreshSessionController } from "../features/auth/session/controller";
import { registerUserController } from "../features/user/register/controller";
import { refreshSessionSchema } from "../schema/session.schema";
import { createUserSchema } from "../schema/user.schema";

const authRoter = t.router({
  registerUser: publicProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => registerUserController({ input, ctx })),
  refreshSession: publicProcedure
    .input(refreshSessionSchema)
    .mutation(async ({ input, ctx }) => refreshSessionController({ input, ctx })
    ),
  test: publicProcedure.query(async () => "Hello, World!"),
});

export default authRoter;
