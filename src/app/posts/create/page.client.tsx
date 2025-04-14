"use client";

import { useAuth } from "@/context/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

type PostData = {
  title: string;
  content: string;
};

const useCreatePost = () => {
  const router = useRouter();
  const { session, isLoadingSession } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const { mutate: createPost } = trpc.post.createPost.useMutation({
    onSuccess: (data) => {
      setSuccessMessage("Post created successfully!");
      setErrorMessage(null);
      // router.push("/posts");
    },
    onError: (error) => {
      setErrorMessage("Failed to create post. Please try again.");
      setSuccessMessage(null);
      console.error("Error creating post:", error);
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  useEffect(() => {
    if (!isLoadingSession && !session) {
      router.push("/auth/login");
    }
  }, [isLoadingSession]);

  const handleCreatePost = async (
    postData: React.FormEvent<HTMLFormElement>
  ) => {
    postData.preventDefault();

    setIsUploading(true);

    const formData = new FormData(postData.currentTarget);
    const data: PostData = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    };

    if (!session) {
      setErrorMessage("You must be logged in to create a post.");
      setIsUploading(false);
      return;
    }

    createPost({
      ...data,
    });
  };

  return {
    handleCreatePost,
    isUploading,
    errorMessage,
    successMessage,
  };
};

export { useCreatePost };
