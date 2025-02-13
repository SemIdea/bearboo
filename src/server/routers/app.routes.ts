import { t } from "../createRouter";
import { authRoter } from "./auth.routes";

export const appRouter = t.router({
  auth: authRoter,
});

export type AppRouter = typeof appRouter;
