import { t } from "../createRouter";
import AuthRoter from "./auth.routes";
import { PostRouter } from "./post.routes";

const appRouter = t.router({
  auth: AuthRoter,
  post: PostRouter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
