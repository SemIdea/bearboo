"use client";

import Link from "next/link";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth";
import { useRequireAuth } from "@/context/auth/useRequireAuth";
import { IPostStatus } from "@/server/models/post";

const selectClassName =
	"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

const MyPostsDescription = () => {
	const { session } = useAuth();

	if (!session) {
		return null;
	}

	return session.user.role === "AUTHOR" ? (
		<CardDescription>
			All your posts, including drafts and archived ones
		</CardDescription>
	) : (
		<CardDescription>
			All posts site-wide ({session.user.role.toLowerCase()} view), including
			drafts and archived ones
		</CardDescription>
	);
};

const MyPostsPanel = () => {
	const { session } = useRequireAuth();

	const [status, setStatus] = useState<IPostStatus | "">("");
	const [categoryId, setCategoryId] = useState("");
	const [tagId, setTagId] = useState("");

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
					<option value="IN_REVIEW">In review</option>
					<option value="SCHEDULED">Scheduled</option>
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

export { MyPostsDescription, MyPostsPanel };
