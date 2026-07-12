import { createCaller } from "@/server/caller";
import { PostFeedList } from "./postFeed.client";
import { Card, CardHeader } from "./ui/card";

const PostFeed = async () => {
	const caller = await createCaller();

	const { posts, nextCursor } = await caller.post.readRecent();

	return (
		<Card className="border-0 shadow-none">
			<CardHeader>
				<PostFeedList initialPosts={posts} initialNextCursor={nextCursor} />
			</CardHeader>
		</Card>
	);
};

export { PostFeed };
