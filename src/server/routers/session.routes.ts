import { protectedProcedure, t } from "../createRouter";
import {
  readUserFromSessionController,
  logoutUserFromSessionController
} from "../features/auth/session/controller";

const SessionRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) =>
    readUserFromSessionController({ ctx })
  ),
  logout: protectedProcedure.mutation(async ({ ctx }) =>
    logoutUserFromSessionController({ ctx })
  )
});

export { SessionRouter };
