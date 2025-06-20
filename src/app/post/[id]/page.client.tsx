"use client";

import MDEditor from "@uiw/react-md-editor";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { CommentEntity } from "@/server/entities/comment/entity";

type Params = {
  id: string;
};

const useGetComments = () => {
  const { id: postId } = useParams<Params>();

  const [comments, setComments] = useState<CommentEntity[] | []>([]);

  const { data: commentsData, isLoading: isCommentsLoading } =
    trpc.comment.findAllCommentsByPost.useQuery(
      { postId: postId },
      {
        enabled: !!postId
      }
    );

  useEffect(() => {
    if (!isCommentsLoading && commentsData) {
      setComments(commentsData);
    }
  }, [commentsData, isCommentsLoading]);

  return {
    comments,
    isCommentsLoading
  };
};

const Comments = () => {
  const { comments, isCommentsLoading } = useGetComments();

  if (isCommentsLoading) {
    return <p>Loading comments...</p>;
  }

  if (comments.length === 0) {
    return <p>No comments yet.</p>;
  }

  return (
    <div>
      <h2>Comments</h2>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4">
          <p>
            <strong>{comment.userId}</strong>: {comment.content}
          </p>
        </div>
      ))}
    </div>
  );
};

const PostMDView = ({ source }: { source: string }) => {
  return <MDEditor.Markdown className="markdown w-[800px]" source={source} />;
};

export { Comments, PostMDView };
