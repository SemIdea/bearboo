import { t } from "../createRouter";
import { AuthRouter } from "./auth.routes";
import { CommentRouter } from "./comment.routes";
import { PostRouter } from "./post.routes";
import { SessionRouter } from "./session.routes";
import { UserRouter } from "./user.routes";

const appRouter = t.router({
  auth: AuthRouter,
  post: PostRouter,
  user: UserRouter,
  comment: CommentRouter,
  session: SessionRouter
});

type AppRouter = typeof appRouter;

export { appRouter };
export type { AppRouter };
