"use client";

import { trpc } from "@/app/_trpc/client";
import { ICommentEntityWithUser } from "@/server/entities/comment/DTO";
import { useEffect, useState } from "react";
import { CreateComment } from "@/components/createComment";
import { Comments } from "@/components/comments";

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

  const addLocalComment = (comment: ICommentEntityWithUser) => {
    setComments((prevComments) => [...prevComments, comment]);
  };

  const updateLocalComment = (updatedComment: ICommentEntityWithUser) => {
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const deleteLocalComment = (id: string) => {
    setComments((prevComments) =>
      prevComments.filter((comment) => comment.id !== id)
    );
  };

  return {
    comments,
    isLoading,
    addLocalComment,
    updateLocalComment,
    deleteLocalComment
  };
};

const CommentArea = ({
  postId,
}: {
  postId: string;
}) => {
  const commentHook = useComment(postId);

  return (
    <>
      <CreateComment postId={postId} commentHook={commentHook} />
      <Comments commentHook={commentHook} />
    </>
  );
};

export { CommentArea };
