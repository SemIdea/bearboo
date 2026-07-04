import { t } from "../../createRouter";
import { procedure_refreshSession } from "./procedures/refreshSession";
import { procedure_readUserFromSession } from "./procedures/readUserFromSession";
import { procedure_logoutUserFromSession } from "./procedures/logoutUserFromSession";
import { procedure_verifyToken } from "./procedures/verifyToken";
import { procedure_resendVerificationEmail } from "./procedures/resendVerificationEmail";
import { procedure_resetPassword } from "./procedures/resetPassword";
import { procedure_sendResetPasswordEmail } from "./procedures/sendResetPasswordEmail";

const SessionRouter = t.router({
  me: procedure_readUserFromSession,
  logout: procedure_logoutUserFromSession
});

const AuthRouter = t.router({
  refreshSession: procedure_refreshSession,
  session: SessionRouter,
  verify: procedure_verifyToken,
  resendVerificationEmail: procedure_resendVerificationEmail,
  resetPassword: procedure_resetPassword,
  sendResetPasswordEmail: procedure_sendResetPasswordEmail
});

export { AuthRouter };
