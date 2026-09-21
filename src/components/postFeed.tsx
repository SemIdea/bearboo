import { cacheLife, cacheTag } from "next/cache";
import { createCaller } from "@/server/caller";
import { PostFeedList } from "./postFeed.client";

const PostFeed = async () => {
	"use cache";
	cacheLife("hours");
	cacheTag("posts");

	const caller = await createCaller();

	const { posts, nextCursor } = await caller.post.readRecent();

	return <PostFeedList initialPosts={posts} initialNextCursor={nextCursor} />;
};

export { PostFeed };
