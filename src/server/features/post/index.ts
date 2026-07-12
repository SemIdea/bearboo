import { t } from "../../createRouter";
import { procedure_createPost } from "./procedures/create";
import { procedure_deletePost } from "./procedures/delete";
import { procedure_readPost } from "./procedures/read";
import { procedure_readPostBySlug } from "./procedures/readBySlug";
import { procedure_readRecentPosts } from "./procedures/readRecent";
import { procedure_readRelatedPosts } from "./procedures/readRelated";
import { procedure_revalidatePost } from "./procedures/revalidate";
import { procedure_updatePost } from "./procedures/update";

const PostRouter = t.router({
	create: procedure_createPost,
	read: procedure_readPost,
	readBySlug: procedure_readPostBySlug,
	readRecent: procedure_readRecentPosts,
	readRelated: procedure_readRelatedPosts,
	update: procedure_updatePost,
	revalidate: procedure_revalidatePost,
	delete: procedure_deletePost,
});

export { PostRouter };
