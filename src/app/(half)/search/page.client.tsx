"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { PostCard } from "@/components/postCard";
import { Button } from "@/components/ui/button";
import { SearchPostsInput } from "@/server/features/post/schema";
import { IPostEntityWithRelations } from "@/server/models/post";

const MIN_QUERY_LENGTH = 2;

const selectClassName =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

const SearchResults = () => {
	const searchParams = useSearchParams();
	const query = searchParams.get("q")?.trim() ?? "";
	const isQueryValid = query.length >= MIN_QUERY_LENGTH;

	const [posts, setPosts] = useState<IPostEntityWithRelations[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [sortBy, setSortBy] =
		useState<NonNullable<SearchPostsInput["sortBy"]>>("recent");
	const utils = trpc.useUtils();

	const { data, isLoading } = trpc.post.search.useQuery(
		{ query, sortBy },
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
			sortBy,
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
			<select
				className={`${selectClassName} mb-4 max-w-xs`}
				value={sortBy}
				onChange={(event) =>
					setSortBy(
						event.target.value as NonNullable<SearchPostsInput["sortBy"]>,
					)
				}
			>
				<option value="recent">Mais recentes</option>
				<option value="mostViewed">Mais acessados</option>
			</select>
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
