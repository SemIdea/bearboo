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
		<>
			<CreateComment postId={postId} commentHook={commentHook} />
			<CommentList commentHook={commentHook} />
		</>
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
		<div className="flex flex-col gap-2">
			<h3 className="text-lg font-semibold">Related posts</h3>
			<ul className="flex flex-col gap-1">
				{relatedPosts.map((relatedPost) => (
					<li key={relatedPost.id}>
						<Link
							href={`/post/${relatedPost.slug}`}
							className="hover:underline"
						>
							{relatedPost.title}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export { CommentArea, RelatedPosts };
