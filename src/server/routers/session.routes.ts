import { protectedProcedure, t } from "../createRouter";
import {
  getUserFromSessionController,
  logoutUserFromSessionController,
} from "../features/auth/session/controller";

const sessionRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) =>
    getUserFromSessionController({ ctx }),
  ),
  logout: protectedProcedure.mutation(async ({ ctx }) =>
    logoutUserFromSessionController({ ctx }),
  ),
});

export { sessionRouter };
