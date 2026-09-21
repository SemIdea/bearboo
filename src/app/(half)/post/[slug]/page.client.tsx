"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { CommentList } from "@/components/commentList";
import { CreateComment } from "@/components/createComment";
import { ICommentEntityWithUser } from "@/server/models/comment";

const useComment = (postId: string) => {
	const [comments, setComments] = useState<ICommentEntityWithUser[]>([]);

	const { data: commentsData, isLoading } = trpc.comment.readAllByPost.useQuery(
		{
			postId,
		},
	);

	useEffect(() => {
		if (commentsData) {
			setComments(commentsData);
		}
	}, [commentsData]);

	const addLocalComment = (comment: ICommentEntityWithUser) => {
		setComments((prevComments) => [...prevComments, comment]);
	};

	const updateLocalComment = (updatedComment: ICommentEntityWithUser) => {
		setComments((prevComments) =>
			prevComments.map((comment) =>
				comment.id === updatedComment.id ? updatedComment : comment,
			),
		);
	};

	const deleteLocalComment = (id: string) => {
		setComments((prevComments) =>
			prevComments.filter((comment) => comment.id !== id),
		);
	};

	return {
		comments,
		isLoading,
		addLocalComment,
		updateLocalComment,
		deleteLocalComment,
	};
};

const CommentArea = ({ postId }: { postId: string }) => {
	const commentHook = useComment(postId);

	return (
		<div className="flex flex-col gap-6">
			<h2 className="text-xl font-bold">Comments</h2>
			<CreateComment postId={postId} commentHook={commentHook} />
			<CommentList commentHook={commentHook} />
		</div>
	);
};

const RelatedPosts = ({
	postId,
	categoryId,
	tagIds,
}: {
	postId: string;
	categoryId: string | null;
	tagIds: string[];
}) => {
	const { data: relatedPosts } = trpc.post.readRelated.useQuery({
		postId,
		categoryId,
		tagIds,
	});

	if (!relatedPosts || relatedPosts.length === 0) {
		return null;
	}

	return (
		<div className="mt-16 flex flex-col gap-5 border-t border-border pt-10">
			<h2 className="text-xl font-bold">Related posts</h2>
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
				{relatedPosts.map((relatedPost) => (
					<Link
						key={relatedPost.id}
						href={`/post/${relatedPost.slug}`}
						className="group flex flex-col gap-2"
					>
						<span className="text-[17px] font-semibold leading-snug transition-colors group-hover:text-brand">
							{relatedPost.title}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
};

export { CommentArea, RelatedPosts };
