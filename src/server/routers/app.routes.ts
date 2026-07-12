import { t } from "../createRouter";
import { AuthRouter } from "../features/auth";
import { CategoryRouter } from "../features/category";
import { CommentRouter } from "../features/comment";
import { PostRouter } from "../features/post";
import { TagRouter } from "../features/tag";
import { UserRouter } from "../features/user";

const appRouter = t.router({
	auth: AuthRouter,
	post: PostRouter,
	user: UserRouter,
	comment: CommentRouter,
	category: CategoryRouter,
	tag: TagRouter,
});

type AppRouter = typeof appRouter;

export type { AppRouter };
export { appRouter };
