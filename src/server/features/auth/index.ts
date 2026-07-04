import { t } from "../../createRouter";
import { refreshSessionProcedure } from "./procedures/refreshSession";
import { readUserFromSessionProcedure } from "./procedures/readUserFromSession";
import { logoutUserFromSessionProcedure } from "./procedures/logoutUserFromSession";
import { verifyTokenProcedure } from "./procedures/verifyToken";
import { resendVerificationEmailProcedure } from "./procedures/resendVerificationEmail";
import { resetPasswordProcedure } from "./procedures/resetPassword";
import { sendResetPasswordEmailProcedure } from "./procedures/sendResetPasswordEmail";

const SessionRouter = t.router({
  me: readUserFromSessionProcedure,
  logout: logoutUserFromSessionProcedure
});

const AuthRouter = t.router({
  refreshSession: refreshSessionProcedure,
  session: SessionRouter,
  verify: verifyTokenProcedure,
  resendVerificationEmail: resendVerificationEmailProcedure,
  resetPassword: resetPasswordProcedure,
  sendResetPasswordEmail: sendResetPasswordEmailProcedure
});

export { AuthRouter };
