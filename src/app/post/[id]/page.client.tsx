"use client";

import { Post } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { CommentEntity } from "@/server/entities/comment/entity";

type Params = {
  id: string;
};

const useGetPost = () => {
  const router = useRouter();
  const { id: postId } = useParams<Params>();

  const [post, setPost] = useState<Post | null>(null);

  const { data: postData, isLoading: isPostLoading } =
    trpc.post.findPost.useQuery(
      { postId: postId },
      {
        enabled: !!postId
      }
    );

  useEffect(() => {
    if (!isPostLoading) {
      if (postData) {
        setPost(postData);
      } else {
        router.push("/");
      }
    }
  }, [postData, isPostLoading]);

  return {
    post,
    isPostLoading
  };
};

const useGetComments = () => {
  const router = useRouter();
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
    if (!isCommentsLoading) {
      if (commentsData) {
        setComments(commentsData);
      } else {
        router.push("/");
      }
    }
  }, [commentsData, isCommentsLoading]);

  return {
    comments,
    isCommentsLoading
  };
};

export { useGetPost, useGetComments };
