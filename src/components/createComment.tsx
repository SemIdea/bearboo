"use client";

import { ICommentEntityWithUser } from "@/server/entities/comment/DTO";
import { CardBase } from "./cardBase";
import { Button } from "./ui/button";
import { useState } from "react";
import { MdEditor } from "./ui/mdEditor";
import { ErrorMessage } from "./ui/errorMessage";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { getErrorMessage } from "@/lib/error";

type ICommentHook = {
  comments: ICommentEntityWithUser[];
  isLoading: boolean;
  addLocalComment: (comment: ICommentEntityWithUser) => void;
  updateLocalComment: (updatedComment: ICommentEntityWithUser) => void;
  deleteLocalComment: (id: string) => void;
};

const useCreateComment = (
  postId: string,
  addLocalComment: (comment: ICommentEntityWithUser) => void,
  setIsCommenting: (isCommenting: boolean) => void
) => {
  const { session } = useAuth();

  const [isSubmiting, setIsSubmiting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: createComment } = trpc.comment.create.useMutation({
    onSuccess: (comment) => {
      addLocalComment({
        ...comment,
        user: session?.user
      } as ICommentEntityWithUser);
      setIsSubmiting(false);
      setIsCommenting(false);
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error.message));
      setIsSubmiting(false);
    }
  });

  const handleCreateComment = (content: string) => {
    setIsSubmiting(true);
    createComment({ postId, content });
  };

  return {
    isSubmiting,
    errorMessage,
    handleCreateComment
  };
};

const CommentEditor = ({
  isSubmiting,
  errorMessage,
  handleCreateComment,
  handleCancelCreate
}: {
  handleCreateComment: (content: string) => void;
  handleCancelCreate: () => void;
  isSubmiting: boolean;
  errorMessage: string | null;
}) => {
  const [comment, setComment] = useState("");

  return (
    <>
      <MdEditor
        preview="live"
        value={comment}
        onChange={(v) => {
          setComment(v || "");
        }}
      />
      <div className="mt-4 flex justify-end gap-2">
        <Button variant={"ghost"} onClick={handleCancelCreate}>
          Cancel
        </Button>
        <Button
          disabled={isSubmiting || !comment.trim()}
          onClick={() => {
            handleCreateComment(comment.trim());
            setComment("");
          }}
        >
          {isSubmiting ? "Submitting..." : "Submit"}
        </Button>
      </div>
      <ErrorMessage error={errorMessage} />
    </>
  );
};

const CreateComment = ({
  postId,
  commentHook
}: {
  postId: string;
  commentHook: ICommentHook;
}) => {
  const [isCommenting, setIsCommenting] = useState(false);

  const { addLocalComment } = commentHook;
  const { isSubmiting, errorMessage, handleCreateComment } = useCreateComment(
    postId,
    addLocalComment,
    setIsCommenting
  );

  return (
    <CardBase
      border
      title="Add a Comment"
      description="Share your thoughts about this post."
      content={
        <div className="space-y-4">
          {!isCommenting && (
            <Button onClick={() => setIsCommenting(true)}>Add Comment</Button>
          )}
          {isCommenting && (
            <CommentEditor
              isSubmiting={isSubmiting}
              errorMessage={errorMessage}
              handleCreateComment={handleCreateComment}
              handleCancelCreate={() => setIsCommenting(false)}
            />
          )}
        </div>
      }
    />
  );
};

export { CreateComment };
