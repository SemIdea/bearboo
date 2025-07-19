import { protectedProcedure, publicProcedure, t } from "../createRouter";
import { refreshSessionController } from "../features/auth/session/controller";
import { resendVerificationEmailController } from "../features/auth/resend-verification/controller";
import { verifyTokenController } from "../features/auth/verify/controller";
import { loginUserController } from "../features/user/login/controller";
import { registerUserController } from "../features/user/register/controller";
import { refreshSessionSchema } from "../schema/session.schema";
import { resendVerificationEmailSchema } from "../schema/resend-verification.schema";
import { verifyTokenSchema } from "../schema/token.schema";
import { registerUserSchema, loginUserSchema } from "../schema/user.schema";
import { SessionRouter } from "./session.routes";

const AuthRouter = t.router({
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
  session: SessionRouter,
  verify: publicProcedure
    .input(verifyTokenSchema)
    .mutation(async ({ input, ctx }) => verifyTokenController({ input, ctx })),
  resendVerificationEmail: publicProcedure
    .input(resendVerificationEmailSchema)
    .mutation(async ({ input, ctx }) =>
      resendVerificationEmailController({ input, ctx })
    )
});

export { AuthRouter };
