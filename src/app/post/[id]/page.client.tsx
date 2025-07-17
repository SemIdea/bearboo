"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistance } from "date-fns";
import MDEditor from "@uiw/react-md-editor";

import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { IPostEntity } from "@/server/entities/post/DTO";
import { IUserEntity } from "@/server/entities/user/DTO";
import { ICommentEntityWithUser } from "@/server/entities/comment/DTO";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MDView } from "@/components/ui/mdview";

const useComment = (postId: string) => {
  const [comments, setComments] = useState<ICommentEntityWithUser[]>([]);

  const { data: commentsData, isLoading } = trpc.comment.readAllByPost.useQuery(
    {
      postId
    }
  );

  useEffect(() => {
    if (commentsData) {
      setComments(commentsData);
    }
  }, [commentsData]);

  const addComment = (comment: ICommentEntityWithUser) => {
    console.log("Adding comment:", comment);
    setComments((prevComments) => [...prevComments, comment]);
  };

  const updateComment = (updatedComment: ICommentEntityWithUser) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const deleteComment = (commentId: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== commentId)
    );
  };

  return {
    comments,
    setComments,
    isLoading,
    addComment,
    updateComment,
    deleteComment
  };
};

const Post = ({
  post,
  user
}: {
  post: IPostEntity;
  user: Omit<IUserEntity, "password">;
}) => {
  const isUpdated =
    new Date(post.createdAt).getTime() !== new Date(post.updatedAt).getTime();

  const createdAt = formatDistance(new Date(post.createdAt), new Date(), {
    addSuffix: true
  });
  const updatedAt = formatDistance(new Date(post.updatedAt), new Date(), {
    addSuffix: true
  });

  const commentHook = useComment(post.id);

  return (
    <Card className="border-0">
      <CardHeader>
        <CardDescription>
          By{" "}
          <Link
            href={`/user/${post.userId}`}
            className="text-blue-600 hover:underline"
          >
            {user.name}
          </Link>
          {" • "}
          {createdAt}
          {isUpdated && (
            <span className="text-muted-foreground"> (edited {updatedAt})</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <h2 className="text-4xl font-bold">{post.title}</h2>
        <MDView source={post.content} />
        <CreateCommentSection postId={post.id} commentHook={commentHook} />
        <CommentsSection userId={user.id} commentHook={commentHook} />
      </CardContent>
    </Card>
  );
};

const useCreateComment = (
  postId: string,
  addComment: (comment: ICommentEntityWithUser) => void
) => {
  const { session } = useAuth();
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const { mutate: createComment } = trpc.comment.create.useMutation({
    onSuccess: (data) => {
      setSuccessMessage("Comment created successfully!");
      setComment("");
      setIsUploading(false);
      setIsCommenting(false);
      addComment({
        ...data,
        user: session?.user
      } as ICommentEntityWithUser);
    },
    onError: () => {
      setErrorMessage("Failed to create comment.");
      setIsUploading(false);
    }
  });

  const handleCreateComment = useCallback(() => {
    if (!session?.user) {
      setErrorMessage("You must be logged in to comment.");
      return;
    }

    if (!comment.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    setIsUploading(true);
    createComment({ postId, content: comment });
  }, [session, postId, comment, createComment]);

  return {
    comment,
    setComment,
    isUploading,
    errorMessage,
    successMessage,
    handleCreateComment,
    isCommenting,
    setIsCommenting
  };
};

const CreateCommentSection = ({
  postId,
  commentHook
}: {
  postId: string;
  commentHook: ReturnType<typeof useComment>;
}) => {
  const {
    comment,
    setComment,
    isUploading,
    errorMessage,
    successMessage,
    handleCreateComment,
    isCommenting,
    setIsCommenting
  } = useCreateComment(postId, commentHook.addComment);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a Comment</CardTitle>
        <CardDescription>Share your thoughts about this post.</CardDescription>
      </CardHeader>
      <CardContent>
        {!isCommenting && (
          <Button onClick={() => setIsCommenting(true)}>Add a comment</Button>
        )}
        {isCommenting && (
          <>
            <MDEditor
              hideToolbar
              className="markdown w-[100%]"
              preview="live"
              value={comment}
              onChange={(v) => {
                setComment(v || "");
              }}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant={"ghost"} onClick={() => setIsCommenting(false)}>
                Cancel
              </Button>
              <Button
                disabled={isUploading || !comment.trim()}
                onClick={handleCreateComment}
              >
                {isUploading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </>
        )}
        {successMessage && (
          <p className="text-green-600 mt-4">{successMessage}</p>
        )}
        {errorMessage && <p className="text-red-600 mt-4">{errorMessage}</p>}
      </CardContent>
    </Card>
  );
};

const useUpdateComment = (
  commentId: string,
  updateComment: (comment: ICommentEntityWithUser) => void
) => {
  const { session } = useAuth();
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate: updateCommentMutation } = trpc.comment.update.useMutation({
    onSuccess: (data) => {
      setSuccessMessage("Comment updated successfully!");
      setComment("");
      setIsUpdating(false);
      updateComment({
        ...data,
        user: session?.user
      } as ICommentEntityWithUser);
    },
    onError: () => {
      setErrorMessage("Failed to update comment.");
      setIsUpdating(false);
    }
  });

  const handleUpdateComment = useCallback(() => {
    if (!comment.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    setIsUpdating(true);
    updateCommentMutation({ id: commentId, content: comment });
  }, [commentId, comment, updateCommentMutation]);

  return {
    comment,
    setComment,
    isUpdating,
    errorMessage,
    successMessage,
    handleUpdateComment
  };
};

const useDeleteComment = (
  commentId: string,
  onDelete: (commentId: string) => void
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate: deleteCommentMutation } = trpc.comment.delete.useMutation({
    onSuccess: () => {
      setSuccessMessage("Comment deleted successfully!");
      setIsDeleting(false);
      onDelete(commentId);
    },
    onError: () => {
      setErrorMessage("Failed to delete comment.");
      setIsDeleting(false);
    }
  });

  const handleDeleteComment = useCallback(() => {
    setIsDeleting(true);
    deleteCommentMutation({ id: commentId });
  }, [commentId, deleteCommentMutation]);

  return {
    isDeleting,
    errorMessage,
    successMessage,
    handleDeleteComment
  };
};

const Comment = ({
  comment,
  isOwner,
  onUpdate,
  onDelete
}: {
  comment: ICommentEntityWithUser;
  isOwner: boolean;
  onUpdate: (updatedComment: ICommentEntityWithUser) => void;
  onDelete: (commentId: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    comment: editComment,
    setComment: setEditComment,
    isUpdating,
    errorMessage,
    successMessage,
    handleUpdateComment
  } = useUpdateComment(comment.id, onUpdate);

  const { isDeleting, handleDeleteComment } = useDeleteComment(
    comment.id,
    onDelete
  );

  const createdAt = formatDistance(new Date(comment.createdAt), new Date(), {
    addSuffix: true
  });

  const updatedAt = formatDistance(new Date(comment.updatedAt), new Date(), {
    addSuffix: true
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditComment(comment.content);
  };

  const handleSave = () => {
    handleUpdateComment();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditComment("");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      handleDeleteComment();
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardDescription className="flex items-center justify-between">
          <div>
            By{" "}
            <Link
              href={`/user/${comment.userId}`}
              className="text-blue-600 hover:underline"
            >
              {comment.user.name}
            </Link>
            {" • "}
            {createdAt}
            {new Date(comment.createdAt).getTime() !==
              new Date(comment.updatedAt).getTime() && (
              <span className="text-muted-foreground">
                {" "}
                (edited {updatedAt})
              </span>
            )}
          </div>
          <div>
            {isOwner && !isEditing && (
              <>
                <Button variant="ghost" onClick={handleEdit}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </>
            )}
          </div>
        </CardDescription>
        <CardContent className="p-0">
          {!isEditing ? (
            <MDView source={comment.content} />
          ) : (
            <div className="space-y-4">
              <MDEditor
                hideToolbar
                className="markdown w-[100%]"
                preview="live"
                value={editComment}
                onChange={(v) => setEditComment(v || "")}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  disabled={isUpdating || !editComment.trim()}
                  onClick={handleSave}
                >
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </div>
              {successMessage && (
                <p className="text-green-600 text-sm">{successMessage}</p>
              )}
              {errorMessage && (
                <p className="text-red-600 text-sm">{errorMessage}</p>
              )}
            </div>
          )}
        </CardContent>
      </CardHeader>
    </Card>
  );
};

const CommentsSection = ({
  userId,
  commentHook
}: {
  userId: string;
  commentHook: ReturnType<typeof useComment>;
}) => {
  const { comments, isLoading, updateComment, deleteComment } = commentHook;

  if (isLoading) return <p>Loading comments...</p>;
  if (!comments || comments.length === 0) return <p>No comments yet.</p>;

  return comments.map((comment, index) => (
    <div key={comment.id}>
      <Comment
        comment={comment}
        isOwner={comment.userId === userId}
        onUpdate={updateComment}
        onDelete={deleteComment}
      />
      {index < comments.length - 1 && <Separator className="my-4" />}
    </div>
  ));
};

export { Post };
