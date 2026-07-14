import { t } from "../../createRouter";
import { procedure_archivePost } from "./procedures/archive";
import { procedure_createPost } from "./procedures/create";
import { procedure_deletePost } from "./procedures/delete";
import { procedure_publishPost } from "./procedures/publish";
import { procedure_readPost } from "./procedures/read";
import { procedure_readPostBySlug } from "./procedures/readBySlug";
import { procedure_readOwnPosts } from "./procedures/readOwn";
import { procedure_readRecentPosts } from "./procedures/readRecent";
import { procedure_readRelatedPosts } from "./procedures/readRelated";
import { procedure_readReviewComments } from "./procedures/readReviewComments";
import { procedure_readSitemapEntries } from "./procedures/readSitemapEntries";
import { procedure_rejectPost } from "./procedures/reject";
import { procedure_revalidatePost } from "./procedures/revalidate";
import { procedure_searchPosts } from "./procedures/search";
import { procedure_submitForReviewPost } from "./procedures/submitForReview";
import { procedure_updatePost } from "./procedures/update";

const PostRouter = t.router({
	create: procedure_createPost,
	read: procedure_readPost,
	readBySlug: procedure_readPostBySlug,
	readOwn: procedure_readOwnPosts,
	readRecent: procedure_readRecentPosts,
	readRelated: procedure_readRelatedPosts,
	readReviewComments: procedure_readReviewComments,
	readSitemapEntries: procedure_readSitemapEntries,
	search: procedure_searchPosts,
	update: procedure_updatePost,
	revalidate: procedure_revalidatePost,
	delete: procedure_deletePost,
	submitForReview: procedure_submitForReviewPost,
	publish: procedure_publishPost,
	reject: procedure_rejectPost,
	archive: procedure_archivePost,
});

export { PostRouter };
