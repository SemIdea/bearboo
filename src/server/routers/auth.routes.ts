import { publicProcedure, t } from "../createRouter";
import { refreshSessionController } from "../features/auth/session/controller";
import {
  resendVerificationEmailController,
  verifyTokenController
} from "../features/auth/verifyToken/controller";
import { loginUserController } from "../features/user/login/controller";
import { registerUserController } from "../features/user/register/controller";
import { refreshSessionSchema } from "../schema/session.schema";
import { resendVerificationEmailSchema } from "../schema/resend-verification.schema";
import { verifyTokenSchema } from "../schema/token.schema";
import { registerUserSchema, loginUserSchema } from "../schema/user.schema";
import { SessionRouter } from "./session.routes";
import {
  resetPasswordController,
  sendResetPasswordEmailController
} from "../features/auth/resetToken/controller";
import {
  resetPasswordSchema,
  sendResetPasswordEmailSchema
} from "../schema/resetPassword.schema";

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
    ),
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input, ctx }) =>
      resetPasswordController({ input, ctx })
    ),
  sendResetPasswordEmail: publicProcedure
    .input(sendResetPasswordEmailSchema)
    .mutation(async ({ input, ctx }) =>
      sendResetPasswordEmailController({ input, ctx })
    )
});

export { AuthRouter };
