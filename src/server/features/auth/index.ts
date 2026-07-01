import { publicProcedure, protectedProcedure, t } from "../../createRouter";
import { refreshSessionController } from "./procedures/refreshSession";
import { readUserFromSessionController } from "./procedures/readUserFromSession";
import { logoutUserFromSessionController } from "./procedures/logoutUserFromSession";
import { verifyTokenController } from "./procedures/verifyToken";
import { resendVerificationEmailController } from "./procedures/resendVerificationEmail";
import { resetPasswordController } from "./procedures/resetPassword";
import { sendResetPasswordEmailController } from "./procedures/sendResetPasswordEmail";
import {
  refreshSessionSchema,
  resendVerificationEmailSchema,
  verifyTokenSchema,
  resetPasswordSchema,
  sendResetPasswordEmailSchema
} from "./schema";

const SessionRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) =>
    readUserFromSessionController({ ctx })
  ),
  logout: protectedProcedure.mutation(async ({ ctx }) =>
    logoutUserFromSessionController({ ctx })
  )
});

const AuthRouter = t.router({
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
