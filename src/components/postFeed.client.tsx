"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { IPostEntityWithRelations } from "@/server/models/post";
import { PostCard } from "./postCard";
import { Button } from "./ui/button";

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
		<>
			{posts.length === 0 && <p>No posts found.</p>}
			{posts.map((post, index) => (
				<PostCard key={post.id} post={post} index={index} />
			))}
			{nextCursor && (
				<Button
					variant="outline"
					className="mt-4"
					onClick={loadMore}
					disabled={isLoading}
				>
					{isLoading ? "Carregando..." : "Carregar mais"}
				</Button>
			)}
		</>
	);
};

export { PostFeedList };
