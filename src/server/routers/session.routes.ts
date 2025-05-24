import { protectedProcedure, t } from "../createRouter";
import { getUserFromSessionController } from "../features/auth/session/controller";

const sessionRouter = t.router({
  me: protectedProcedure.query(async ({ ctx }) =>
    getUserFromSessionController({ ctx }),
  ),
});

export { sessionRouter };
