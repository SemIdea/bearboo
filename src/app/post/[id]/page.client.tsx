"use client";

import { Post } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/app/_trpc/client";

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
        enabled: !!postId,
      },
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
    isPostLoading,
  };
};

export { useGetPost };
