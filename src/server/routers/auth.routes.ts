import { publicProcedure, t } from "../createRouter";
import { refreshSessionController } from "../features/auth/session/controller";
import { loginUserController } from "../features/user/login/controller";
import { registerUserController } from "../features/user/register/controller";
import { refreshSessionSchema } from "../schema/session.schema";
import { registerUserSchema, loginUserSchema } from "../schema/user.schema";
import { sessionRouter } from "./session.routes";

const authRoter = t.router({
  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input, ctx }) => registerUserController({ input, ctx })),
  loginUser: publicProcedure
    .input(loginUserSchema)
    .mutation(async ({ input, ctx }) => loginUserController({ input, ctx })),
  refreshSession: t.procedure
    .input(refreshSessionSchema)
    .mutation(async ({ input, ctx }) =>
      refreshSessionController({ input, ctx })
    ),
  session: sessionRouter,
  test: publicProcedure.query(async () => "Hello, World!"),
});

export default authRoter;
