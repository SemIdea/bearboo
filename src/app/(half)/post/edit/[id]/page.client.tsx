"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { FormBase, InputField } from "@/components/formBase";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { MdEditor } from "@/components/ui/mdEditor";
import { useAuth } from "@/context/auth";
import { getErrorMessage } from "@/lib/error";
import {
	UpdatePostInput,
	updatePostSchema,
} from "@/server/features/post/schema";
import { IPostEntity } from "@/server/models/post";

const textareaClassName =
	"flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

const useUpdatePost = (post: IPostEntity) => {
	const router = useRouter();
	const { id } = post;
	const { session, isLoadingSession } = useAuth();

	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<null | string>(null);
	const [successMessage, setSuccessMessage] = useState<null | string>(null);

	const { mutate: revalidatePost } = trpc.post.revalidate.useMutation();

	const { mutate: updatePost } = trpc.post.update.useMutation({
		onSuccess: () => {
			setErrorMessage(null);
			revalidatePost({
				id,
			});
			setSuccessMessage("Post updated successfully!");
		},
		onError: (error) => {
			setSuccessMessage(null);
			setErrorMessage(getErrorMessage(error.message));
		},
		onSettled: () => {
			setIsUploading(false);
		},
	});

	const { mutate: deletePost } = trpc.post.delete.useMutation({
		onSuccess: () => {
			setSuccessMessage("Post deleted successfully!");
			setErrorMessage(null);
			router.push("/");
		},
		onError: (error) => {
			setErrorMessage(getErrorMessage(error.message));
			setSuccessMessage(null);
		},
		onSettled: () => {
			setIsDeleting(false);
		},
	});

	useEffect(() => {
		if (!isLoadingSession && !session) {
			router.push("/auth/login");
		}
	}, [isLoadingSession]);

	const handleCreate = async (data: UpdatePostInput) => {
		setErrorMessage(null);
		setIsUploading(true);

		updatePost(data);
	};

	const handleDelete = async () => {
		setIsDeleting(true);

		deletePost({
			id,
		});
	};

	return {
		isUploading,
		isDeleting,
		successMessage,
		errorMessage,
		handleCreate,
		handleDelete,
	};
};

const DeletePostButton = ({ post }: { post: IPostEntity }) => {
	const { handleDelete: handleDeletePost, isDeleting } = useUpdatePost(post);

	return (
		<Button
			variant="destructive"
			className="mt-2"
			onClick={handleDeletePost}
			disabled={isDeleting}
		>
			{isDeleting ? "Deleting Post..." : "Delete Post"}
		</Button>
	);
};

const UpdatePostForm = ({ post }: { post: IPostEntity }) => {
	const { isUploading, errorMessage, successMessage, handleCreate } =
		useUpdatePost(post);

	return (
		<FormBase
			schema={updatePostSchema}
			onSubmit={handleCreate}
			defaultValues={{ ...post }}
		>
			<InputField name="title" label="Title" placeholder="Enter post title" />
			<InputField name="content" label="Content">
				<MdEditor preview="live" />
			</InputField>
			<InputField
				name="coverImageUrl"
				label="Cover image URL"
				placeholder="https://..."
			/>
			<InputField name="slug" label="Slug" placeholder="url-friendly-slug" />
			<InputField
				name="seoTitle"
				label="SEO title override (optional)"
				placeholder="Leave empty to use the post title"
			/>
			<InputField
				name="seoDescription"
				label="SEO description override (optional)"
				placeholder="Leave empty to use the post content"
			/>
			<InputField
				name="canonicalUrl"
				label="Canonical URL override (optional)"
				placeholder="https://... (e.g. cross-posted original)"
			/>
			<Button type="submit" disabled={isUploading}>
				{isUploading ? "Editing Post..." : "Edit Post"}
			</Button>
			<ErrorMessage error={errorMessage} />
			{successMessage && (
				<p className="text-green-600 text-sm text-center">{successMessage}</p>
			)}
		</FormBase>
	);
};

const PostWorkflowActions = ({ post }: { post: IPostEntity }) => {
	const { session } = useAuth();
	const utils = trpc.useUtils();

	const [scheduledAt, setScheduledAt] = useState("");
	const [comment, setComment] = useState("");
	const [errorMessage, setErrorMessage] = useState<null | string>(null);

	const { data: reviewComments } = trpc.post.readReviewComments.useQuery(
		{ postId: post.id },
		{ enabled: !!session },
	);

	const invalidate = () => {
		utils.post.read.invalidate({ id: post.id });
		utils.post.readReviewComments.invalidate({ postId: post.id });
	};

	const onError = (error: { message: string }) => {
		setErrorMessage(getErrorMessage(error.message));
	};

	const { mutate: submitForReview } = trpc.post.submitForReview.useMutation({
		onSuccess: invalidate,
		onError,
	});
	const { mutate: publish } = trpc.post.publish.useMutation({
		onSuccess: () => {
			setComment("");
			setScheduledAt("");
			invalidate();
		},
		onError,
	});
	const { mutate: reject } = trpc.post.reject.useMutation({
		onSuccess: () => {
			setComment("");
			invalidate();
		},
		onError,
	});
	const { mutate: archive } = trpc.post.archive.useMutation({
		onSuccess: invalidate,
		onError,
	});

	if (!session) return null;

	const isOwner = session.user.id === post.userId;
	const canReview = session.user.role !== "AUTHOR";

	return (
		<div className="flex flex-col gap-3 border-t pt-4 mt-4">
			<p className="text-muted-foreground text-xs">Status: {post.status}</p>

			<div className="flex flex-wrap items-center gap-2">
				{isOwner && post.status === "DRAFT" && (
					<Button
						type="button"
						variant="outline"
						onClick={() => submitForReview({ id: post.id })}
					>
						Submit for review
					</Button>
				)}

				{canReview &&
					(post.status === "DRAFT" || post.status === "IN_REVIEW") && (
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								publish({
									id: post.id,
									scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
									comment: comment || undefined,
								})
							}
						>
							{scheduledAt ? "Schedule" : "Publish"}
						</Button>
					)}

				{canReview && post.status === "IN_REVIEW" && (
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							if (!comment) {
								setErrorMessage("A reason is required to reject a post.");
								return;
							}
							reject({ id: post.id, comment });
						}}
					>
						Reject
					</Button>
				)}

				{canReview && post.status !== "ARCHIVED" && (
					<Button
						type="button"
						variant="destructive"
						onClick={() => archive({ id: post.id })}
					>
						Archive
					</Button>
				)}
			</div>

			{canReview &&
				(post.status === "DRAFT" || post.status === "IN_REVIEW") && (
					<div className="flex flex-col gap-2">
						<input
							type="datetime-local"
							value={scheduledAt}
							onChange={(event) => setScheduledAt(event.target.value)}
							className={textareaClassName}
						/>
						<textarea
							placeholder="Optional comment (required to reject)"
							value={comment}
							onChange={(event) => setComment(event.target.value)}
							className={textareaClassName}
						/>
					</div>
				)}

			<ErrorMessage error={errorMessage} />

			{reviewComments && reviewComments.length > 0 && (
				<div className="flex flex-col gap-2">
					<p className="text-sm font-medium">Review history</p>
					{reviewComments.map((reviewComment) => (
						<div key={reviewComment.id} className="text-sm">
							<span className="font-medium">{reviewComment.type}</span> by{" "}
							{reviewComment.reviewer.name}
							{reviewComment.content && `: ${reviewComment.content}`}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export { DeletePostButton, PostWorkflowActions, UpdatePostForm };
