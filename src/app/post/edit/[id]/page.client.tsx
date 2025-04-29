"use client";

import { Post } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";

type PostData = {
  title: string;
  content: string;
};

// Improve. If the user is not the owner of the post, do something
const useUpdatePost = () => {
  const router = useRouter();
  const params = useParams();
  const { session, isLoadingSession } = useAuth();

  const [postId, setPostId] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const { mutate: updatePost } = trpc.post.updatePost.useMutation({
    onSuccess: () => {
      setSuccessMessage("Post updated successfully!");
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage("Failed to update post. Please try again.");
      setSuccessMessage(null);
      console.error("Error creating post:", error);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const { data } = trpc.post.findPost.useQuery(
    { postId: postId as string },
    {
      enabled: !!postId,
    },
  );

  useEffect(() => {
    if (!isLoadingSession && !session) {
      router.push("auth/login");
    }
  }, [isLoadingSession]);

  useEffect(() => {
    if (params?.id && typeof params.id === "string") {
      setPostId(params.id);
    }
  }, [params]);

  useEffect(() => {
    if (data) {
      setPost(data);
    }
  }, [data]);

  const handleUpdatePost = async (
    postData: React.FormEvent<HTMLFormElement>,
  ) => {
    // Improve. Verify all data before sending
    postData.preventDefault();

    if (!session)
      return setErrorMessage("You must be logged in to update a post.");

    if (!postId)
      return setErrorMessage("Post ID is required to update a post.");

    setIsUploading(true);

    const formData = new FormData(postData.currentTarget);

    const data: PostData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    };

    updatePost({
      ...data,
      postId,
    });
  };

  return {
    handleUpdatePost,
    isUploading,
    successMessage,
    errorMessage,
    post,
  };
};

export { useUpdatePost };
