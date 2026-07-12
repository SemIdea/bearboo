"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { IPostStatus } from "@/server/models/post";

const selectClassName =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

const MyPostsPanel = () => {
	const router = useRouter();
	const { session, isLoadingSession } = useAuth();

	const [status, setStatus] = useState<IPostStatus | "">("");
	const [categoryId, setCategoryId] = useState("");
	const [tagId, setTagId] = useState("");

	useEffect(() => {
		if (!isLoadingSession && !session) {
			router.push("/auth/login");
		}
	}, [isLoadingSession, session, router]);

	const { data: categories } = trpc.category.readAll.useQuery();
	const { data: tags } = trpc.tag.readAll.useQuery();

	const { data: posts, isLoading } = trpc.post.readOwn.useQuery(
		{
			status: status || undefined,
			categoryId: categoryId || undefined,
			tagId: tagId || undefined,
		},
		{ enabled: !!session },
	);

	if (!session) {
		return null;
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap gap-2">
				<select
					className={selectClassName}
					value={status}
					onChange={(event) =>
						setStatus(event.target.value as IPostStatus | "")
					}
				>
					<option value="">All statuses</option>
					<option value="DRAFT">Draft</option>
					<option value="PUBLISHED">Published</option>
					<option value="ARCHIVED">Archived</option>
				</select>
				<select
					className={selectClassName}
					value={categoryId}
					onChange={(event) => setCategoryId(event.target.value)}
				>
					<option value="">All categories</option>
					{categories?.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
				<select
					className={selectClassName}
					value={tagId}
					onChange={(event) => setTagId(event.target.value)}
				>
					<option value="">All tags</option>
					{tags?.map((tag) => (
						<option key={tag.id} value={tag.id}>
							{tag.name}
						</option>
					))}
				</select>
			</div>

			{isLoading && <p>Loading...</p>}
			{!isLoading && posts?.length === 0 && <p>No posts found.</p>}
			{posts?.map((post) => (
				<Card key={post.id} className="border-0 shadow-none">
					<CardContent>
						<CardTitle className="flex items-center gap-2">
							<Link href={`/post/${post.slug}`} className="hover:underline">
								{post.title}
							</Link>
							<span className="text-muted-foreground text-xs">
								{post.status}
							</span>
							{session.user.role !== "AUTHOR" && (
								<span className="text-muted-foreground text-xs">
									by {post.user.name}
								</span>
							)}
						</CardTitle>
						<Link
							href={`/post/edit/${post.id}`}
							className="text-sm hover:underline"
						>
							Edit
						</Link>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export { MyPostsPanel };
