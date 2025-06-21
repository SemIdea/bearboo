"use client";

import MDEditor from "@uiw/react-md-editor";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { CommentEntity } from "@/server/entities/comment/entity";
import { useAuth } from "@/context/auth";

type Params = {
  id: string;
};

const CreateCommentSection = ({
  addComment
}: {
  addComment: (newComment: CommentEntity) => void;
}) => {
  const { id: postId } = useParams<Params>();
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { mutate: createComment } = trpc.comment.createComment.useMutation({
    onSuccess: (data) => {
      setSuccessMessage("Comment created successfully!");
      setComment("");
      setIsUploading(false);
      addComment(data);
    },
    onError: () => {
      setErrorMessage("Failed to create comment.");
      setIsUploading(false);
    }
  });

  const handleCreateComment = useCallback(() => {
    if (!comment.trim()) {
      return alert("Comment cannot be empty.");
    }

    setIsUploading(true);
    createComment({ postId, content: comment });
  }, [comment, postId, createComment]);

  return (
    <div>
      <h2>Create Comment</h2>
      <input
        placeholder="Your comment"
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        disabled={isUploading || !comment.trim()}
        type="submit"
        onClick={handleCreateComment}
      >
        Comment
      </button>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

const Comments = () => {
  const { id: postId } = useParams<Params>();
  const { session } = useAuth();

  const [comments, setComments] = useState<CommentEntity[]>([]);

  const { data: commentsData, isLoading: isCommentsLoading } =
    trpc.comment.findAllCommentsByPost.useQuery(
      { postId },
      { enabled: !!postId }
    );

  useEffect(() => {
    if (commentsData) setComments(commentsData);
  }, [commentsData]);

  const { mutate: deleteComment } = trpc.comment.deleteComment.useMutation();

  const handleDeleteComment = (id: string) => {
    deleteComment(
      { id },
      {
        onSuccess: () => {
          setComments((prevComments) =>
            prevComments.filter((comment) => comment.id !== id)
          );
        }
      }
    );
  };

  const addComment = (newComment: CommentEntity) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };

  return (
    <div>
      <div>
        <h2>Comments</h2>
        {isCommentsLoading && <p>Loading comments...</p>}
        {!isCommentsLoading && comments.length === 0 && <p>No comments yet.</p>}
        {!isCommentsLoading &&
          comments.length > 0 &&
          comments.map((comment) => (
            <div key={comment.id} className="mb-4">
              {session?.user.id === comment.userId && (
                <button onClick={() => handleDeleteComment(comment.id)}>
                  Delete Comment
                </button>
              )}
              <p>
                <strong>{comment.userId}</strong>: {comment.content}
              </p>
            </div>
          ))}
      </div>
      <CreateCommentSection addComment={addComment} />
    </div>
  );
};

const PostMDView = ({ source }: { source: string }) => {
  return <MDEditor.Markdown className="markdown w-[800px]" source={source} />;
};

export { Comments, PostMDView };
