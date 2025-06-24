"use client";

import MDEditor from "@uiw/react-md-editor";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { ICommentEntity } from "@/server/entities/comment/DTO";

type Params = {
  id: string;
};

type IBaseCommentDTO = {
  setComments: React.Dispatch<React.SetStateAction<ICommentEntity[]>>;
};

type ICreateCommentDTO = IBaseCommentDTO;

type ICommentItemDTO = IBaseCommentDTO & {
  comment: ICommentEntity;
  isOwner: boolean;
  onEdit: () => void;
};

type IUpdateCommentItemDTO = IBaseCommentDTO & {
  comment: ICommentEntity;
  onCancel: () => void;
};

const CreateCommentItem = ({ setComments }: ICreateCommentDTO) => {
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
      setComments((prevComments) => [...prevComments, data]);
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

const CommentItem = ({
  comment,
  isOwner,
  onEdit,
  setComments
}: ICommentItemDTO) => {
  const { mutate: deleteComment } = trpc.comment.deleteComment.useMutation({
    onSuccess: () => {
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== comment.id)
      );
    }
  });

  const handleDeleteComment = () => {
    deleteComment({ id: comment.id });
  };

  return (
    <div>
      <p>
        <strong>{comment.userId}</strong>: {comment.content}
      </p>
      {isOwner && (
        <>
          <button onClick={handleDeleteComment}>Delete</button>
          <br />
          <button onClick={onEdit}>Edit</button>
        </>
      )}
    </div>
  );
};

const EditCommentItem = ({
  comment,
  onCancel,
  setComments
}: IUpdateCommentItemDTO) => {
  const [editedContent, setEditedContent] = useState(comment.content);

  const { mutate: updateComment } = trpc.comment.updateComment.useMutation({
    onSuccess: (data) => {
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === data.id ? { ...c, content: data.content } : c
        )
      );
      onCancel();
    }
  });

  const handleUpdateComment = () => {
    updateComment({
      id: comment.id,
      content: editedContent
    });
  };

  return (
    <div>
      <input
        type="text"
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
      />
      <br />
      <button onClick={handleUpdateComment}>Save</button>
      <br />
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

const Comments = () => {
  const { id: postId } = useParams<Params>();
  const { session } = useAuth();

  const [comments, setComments] = useState<ICommentEntity[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const { data: commentsData, isLoading: isCommentsLoading } =
    trpc.comment.readAllCommentsByPost.useQuery(
      { postId },
      { enabled: !!postId }
    );

  useEffect(() => {
    if (commentsData) setComments(commentsData);
  }, [commentsData]);

  return (
    <div>
      <div>
        <h2>Comments</h2>
        {isCommentsLoading && <p>Loading comments...</p>}
        {!isCommentsLoading && comments.length === 0 && <p>No comments yet.</p>}
        {!isCommentsLoading &&
          comments.length > 0 &&
          comments.map((comment) => {
            const isOwner = session?.user?.id === comment.userId;

            const isEditing = comment.id === editingCommentId;

            if (isEditing)
              return (
                <EditCommentItem
                  key={comment.id}
                  comment={comment}
                  setComments={setComments}
                  onCancel={() => {
                    setEditingCommentId(null);
                  }}
                />
              );

            return (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={isOwner}
                setComments={setComments}
                onEdit={() => {
                  setEditingCommentId(comment.id);
                }}
              />
            );
          })}
      </div>
      <CreateCommentItem setComments={setComments} />
    </div>
  );
};

const PostMDView = ({ source }: { source: string }) => {
  return <MDEditor.Markdown className="markdown w-[800px]" source={source} />;
};

export { Comments, PostMDView };
