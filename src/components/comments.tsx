import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { getErrorMessage } from "@/lib/error";
import { ICommentEntityWithUser } from "@/server/entities/comment/DTO";
import { useState } from "react";
import { Comment } from "./comment";
import { Separator } from "./ui/separator";

type ICommentHook = {
  comments: ICommentEntityWithUser[];
  isLoading: boolean;
  addLocalComment: (comment: ICommentEntityWithUser) => void;
  updateLocalComment: (updatedComment: ICommentEntityWithUser) => void;
  deleteLocalComment: (id: string) => void;
};

const useUpdateComment = (
  updateLocalComment: (comment: ICommentEntityWithUser) => void
) => {
  const { session } = useAuth();

  const [commentBeingUpdated, setCommentBeingUpdated] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: updateCommentMutation } = trpc.comment.update.useMutation({
    onSuccess: (data) => {
      setCommentBeingUpdated("");
      updateLocalComment({
        ...data,
        user: session?.user
      } as ICommentEntityWithUser);
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error.message));
      setCommentBeingUpdated("");
    }
  });

  const handleUpdate = (updateComment: ICommentEntityWithUser) => {
    setCommentBeingUpdated(updateComment.id);
    updateCommentMutation(updateComment);
  };

  return {
    commentBeingUpdated,
    errorMessage,
    handleUpdate
  };
};

const useDeleteComment = (deleteLocalcomment: (commentId: string) => void) => {
  const [commentBeingDeleted, setCommentBeingDeleted] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: deleteComment } = trpc.comment.delete.useMutation({
    onSuccess: () => {
      deleteLocalcomment(commentBeingDeleted);
      setCommentBeingDeleted("");
    },
    onError: () => {
      setErrorMessage("Failed to delete comment.");
      setCommentBeingDeleted("");
    }
  });

  const handleDelete = (id: string) => {
    setCommentBeingDeleted(id);
    deleteComment({ id });
  };

  return {
    commentBeingDeleted,
    errorMessage,
    handleDelete
  };
};

const Comments = ({
  userId,
  commentHook
}: {
  userId: string;
  commentHook: ICommentHook;
}) => {
  const [commentBeingEdited, setCommentBeingEdited] = useState("");

  const { comments, isLoading, deleteLocalComment, updateLocalComment } =
    commentHook;
  const {
    commentBeingUpdated,
    errorMessage: updateErrorMessage,
    handleUpdate: handleUpdateComment
  } = useUpdateComment(updateLocalComment);
  const {
    commentBeingDeleted,
    errorMessage: deleteErrorMessage,
    handleDelete
  } = useDeleteComment(deleteLocalComment);

  if (isLoading) return <p>Loading comments...</p>;
  if (!comments || comments.length === 0) return <p>No comments yet.</p>;

  return comments.map((comment, index) => (
    <div key={comment.id}>
      <Comment
        comment={comment}
        editing={comment.id === commentBeingEdited}
        isOwner={comment.userId === userId}
        isUpdating={comment.id === commentBeingUpdated}
        isDeleting={comment.id === commentBeingDeleted}
        errorMessage={deleteErrorMessage || updateErrorMessage}
        setCommentBeingEdited={setCommentBeingEdited}
        handleUpdate={handleUpdateComment}
        handleDelete={handleDelete}
      />
      {index < comments.length - 1 && <Separator className="my-4" />}
    </div>
  ));
};


export { Comments };