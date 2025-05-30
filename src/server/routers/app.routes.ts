import { t } from "../createRouter";
import { AuthRouter } from "./auth.routes";
import { PostRouter } from "./post.routes";
import { UserRouter } from "./user.routes";

const appRouter = t.router({
  auth: AuthRouter,
  post: PostRouter,
  user: UserRouter,
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
