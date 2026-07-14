"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Input } from "./ui/input";

const MIN_QUERY_LENGTH = 2;
const SUGGESTIONS_LIMIT = 5;
const DEBOUNCE_MS = 300;

const SearchBox = () => {
	const router = useRouter();
	const utils = trpc.useUtils();

	const [term, setTerm] = useState("");
	const [suggestions, setSuggestions] = useState<
		{ id: string; slug: string; title: string }[]
	>([]);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		if (term.trim().length < MIN_QUERY_LENGTH) {
			setSuggestions([]);
			return;
		}

		debounceRef.current = setTimeout(async () => {
			const result = await utils.post.search.fetch({
				query: term.trim(),
				limit: SUGGESTIONS_LIMIT,
			});
			setSuggestions(result.posts);
		}, DEBOUNCE_MS);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, [term, utils]);

	const submitSearch = (event: React.FormEvent) => {
		event.preventDefault();
		const trimmed = term.trim();

		if (trimmed.length < MIN_QUERY_LENGTH) {
			return;
		}

		setSuggestions([]);
		router.push(`/search?q=${encodeURIComponent(trimmed)}`);
	};

	return (
		<form onSubmit={submitSearch} className="relative">
			<Input
				type="search"
				placeholder="Search posts..."
				value={term}
				onChange={(event) => setTerm(event.target.value)}
				className="w-48"
			/>
			{suggestions.length > 0 && (
				<ul className="bg-popover absolute top-full left-0 z-10 mt-1 w-64 rounded-md border shadow-md">
					{suggestions.map((post) => (
						<li key={post.id}>
							<Link
								href={`/post/${post.slug}`}
								className="block px-3 py-2 text-sm hover:underline"
								onClick={() => setSuggestions([])}
							>
								{post.title}
							</Link>
						</li>
					))}
				</ul>
			)}
		</form>
	);
};

export { SearchBox };
