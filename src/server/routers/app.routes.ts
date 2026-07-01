import { t } from "../createRouter";
import { AuthRouter } from "../features/auth";
import { CommentRouter } from "../features/comment";
import { PostRouter } from "../features/post";
import { UserRouter } from "../features/user";

const appRouter = t.router({
  auth: AuthRouter,
  post: PostRouter,
  user: UserRouter,
  comment: CommentRouter
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
