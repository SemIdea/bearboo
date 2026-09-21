"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { trpc } from "@/app/_trpc/client";
import { PostCard } from "@/components/postCard";
import { PostFeedSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SearchPostsInput } from "@/server/features/post/schema";
import { IPostEntityWithRelations } from "@/server/models/post";

const MIN_QUERY_LENGTH = 2;

const SearchResults = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams.get("q")?.trim() ?? "";
	const isQueryValid = query.length >= MIN_QUERY_LENGTH;

	const [term, setTerm] = useState(query);
	const [posts, setPosts] = useState<IPostEntityWithRelations[]>([]);
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [sortBy, setSortBy] =
		useState<NonNullable<SearchPostsInput["sortBy"]>>("recent");
	const utils = trpc.useUtils();

	useEffect(() => {
		setTerm(query);
	}, [query]);

	const { data, isLoading } = trpc.post.search.useQuery(
		{ query, sortBy },
		{ enabled: isQueryValid },
	);

	useEffect(() => {
		setPosts(data?.posts ?? []);
		setNextCursor(data?.nextCursor ?? null);
	}, [data]);

	const submitSearch = (event: React.FormEvent) => {
		event.preventDefault();
		const trimmed = term.trim();

		if (trimmed.length < MIN_QUERY_LENGTH) {
			return;
		}

		router.push(`/search?q=${encodeURIComponent(trimmed)}`);
	};

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

	return (
		<div className="flex flex-col gap-8">
			<form
				onSubmit={submitSearch}
				className="flex h-13 items-center gap-2.5 rounded-lg border border-input px-4 focus-within:ring-2 focus-within:ring-ring"
			>
				<FaSearch className="size-4 shrink-0 text-muted-foreground" />
				<input
					type="search"
					value={term}
					onChange={(event) => setTerm(event.target.value)}
					placeholder="Search posts…"
					className="flex-1 border-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
				/>
			</form>

			{isQueryValid && (
				<div className="flex items-center justify-between">
					<span className="text-sm text-muted-foreground">
						{isLoading
							? "Searching…"
							: `${posts.length} result${posts.length === 1 ? "" : "s"} for "${query}"`}
					</span>
					<label className="flex items-center gap-2 text-sm">
						<span className="text-muted-foreground">Sort</span>
						<select
							className="h-9 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
							value={sortBy}
							onChange={(event) =>
								setSortBy(
									event.target.value as NonNullable<SearchPostsInput["sortBy"]>,
								)
							}
						>
							<option value="recent">Most recent</option>
							<option value="mostViewed">Most viewed</option>
						</select>
					</label>
				</div>
			)}

			{!isQueryValid && (
				<p className="text-sm text-muted-foreground">
					Type at least {MIN_QUERY_LENGTH} characters to search.
				</p>
			)}

			{isLoading && <PostFeedSkeleton count={3} />}

			{isQueryValid && !isLoading && posts.length === 0 && (
				<div className="flex flex-col items-center gap-3 py-20 text-center">
					<FaSearch className="size-8 text-muted-foreground opacity-60" />
					<p className="text-base font-semibold">
						No posts found for &quot;{query}&quot;
					</p>
					<p className="max-w-sm text-sm text-muted-foreground">
						Try a different term, or browse everything from the home page.
					</p>
				</div>
			)}

			{posts.length > 0 && (
				<div className="flex flex-col">
					{posts.map((post) => (
						<PostCard key={post.id} post={post} />
					))}
				</div>
			)}

			{nextCursor && (
				<div className="flex justify-center">
					<Button variant="outline" onClick={loadMore} disabled={isLoadingMore}>
						{isLoadingMore && <Spinner />}
						{isLoadingMore ? "Loading..." : "Load more"}
					</Button>
				</div>
			)}
		</div>
	);
};

export { SearchResults };
