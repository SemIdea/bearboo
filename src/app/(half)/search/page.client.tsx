"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { PostCard } from "@/components/postCard";
import { Button } from "@/components/ui/button";
import { IPostEntityWithRelations } from "@/server/models/post";

const MIN_QUERY_LENGTH = 2;

const SearchResults = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("q")?.trim() ?? "";
	const isQueryValid = query.length >= MIN_QUERY_LENGTH;

	const [posts, setPosts] = useState<IPostEntityWithRelations[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const utils = trpc.useUtils();

	const { data, isLoading } = trpc.post.search.useQuery(
		{ query },
		{ enabled: isQueryValid },
	);

	useEffect(() => {
		setPosts(data?.posts ?? []);
		setNextCursor(data?.nextCursor ?? null);
	}, [data]);

	const loadMore = async () => {
		if (!nextCursor || isLoadingMore) {
			return;
		}

		setIsLoadingMore(true);
		const nextPage = await utils.post.search.fetch({
			query,
			cursor: nextCursor,
		});
		setPosts((previousPosts) => [...previousPosts, ...nextPage.posts]);
		setNextCursor(nextPage.nextCursor);
		setIsLoadingMore(false);
	};

	if (!isQueryValid) {
		return <p>Type at least {MIN_QUERY_LENGTH} characters to search.</p>;
	}

	if (isLoading) {
		return <p>Searching...</p>;
	}

	return (
		<>
			{posts.length === 0 && <p>No posts found for &quot;{query}&quot;.</p>}
			{posts.map((post, index) => (
				<PostCard key={post.id} post={post} index={index} />
			))}
			{nextCursor && (
				<Button
					variant="outline"
					className="mt-4"
					onClick={loadMore}
					disabled={isLoadingMore}
				>
					{isLoadingMore ? "Carregando..." : "Carregar mais"}
				</Button>
			)}
		</>
	);
};

export { SearchResults };
