"use client";

import { formatDistance } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { IPostEntityWithRelations } from "@/server/models/post";
import { Button } from "./ui/button";
import { By } from "./ui/by";
import { Card, CardContent, CardDescription, CardTitle } from "./ui/card";

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
				<Post key={post.id} post={post} index={index} />
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

const Post = ({
	post,
	index,
}: {
	post: IPostEntityWithRelations;
	index: number;
}) => {
	const createdDistance = formatDistance(new Date(post.createdAt), new Date(), {
		addSuffix: true,
	});

	return (
		<Card className="border-0 shadow-none">
			<CardContent>
				<CardTitle className="flex">
					<span className="mr-2">{index + 1}.</span>
					<Link href={`/post/${post.slug}`} className="hover:underline">
						<h2 className="font-semibold">{post.title}</h2>
					</Link>
				</CardTitle>
				<CardDescription className="ml-5">
					<By name={post.user.name} id={post.user.id} /> {createdDistance}
				</CardDescription>
			</CardContent>
		</Card>
	);
};

export { PostFeedList };
