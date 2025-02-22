import { t } from "../createRouter";
import AuthRoter from "./auth.routes";

const appRouter = t.router({
  auth: AuthRoter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
