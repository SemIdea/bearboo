"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { IPostEntityWithRelations } from "@/server/models/post";
import { PostCard } from "./postCard";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

type PostFeedListProps = {
	initialPosts: IPostEntityWithRelations[];
	initialNextCursor: string | null;
};

const PostFeedList = ({
	initialPosts,
	initialNextCursor,
}: PostFeedListProps) => {
	const [posts, setPosts] = useState(initialPosts);
	const [nextCursor, setNextCursor] = useState(initialNextCursor);
	const [isLoading, setIsLoading] = useState(false);
	const utils = trpc.useUtils();

	const loadMore = async () => {
		if (!nextCursor || isLoading) {
			return;
		}

		setIsLoading(true);
		const nextPage = await utils.post.readRecent.fetch({ cursor: nextCursor });
		setPosts((previousPosts) => [...previousPosts, ...nextPage.posts]);
		setNextCursor(nextPage.nextCursor);
		setIsLoading(false);
	};

	return (
		<div className="flex flex-col">
			{posts.length === 0 && (
				<div className="flex flex-col items-center gap-3 py-24 text-center">
					<p className="text-base font-semibold">No posts found</p>
					<p className="max-w-xs text-sm text-muted-foreground">
						Nothing has been published yet. Check back soon.
					</p>
				</div>
			)}
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
			{nextCursor && (
				<div className="flex justify-center pt-6">
					<Button variant="outline" onClick={loadMore} disabled={isLoading}>
						{isLoading && <Spinner />}
						{isLoading ? "Loading..." : "Load more"}
					</Button>
				</div>
			)}
		</div>
	);
};

export { PostFeedList };
