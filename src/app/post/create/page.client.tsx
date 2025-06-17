"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
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
      router.push(`/posts/${data.id}`);
    },
    onError: (error) => {
      setErrorMessage("Failed to create post. Please try again.");
      setSuccessMessage(null);
      console.error("Error creating post:", error);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  useEffect(() => {
    if (!isLoadingSession && !session) {
      router.push("/auth/login");
    }
  }, [isLoadingSession]);

  return {
    createPost,
    isUploading,
    errorMessage,
    successMessage
  };
};

export { useCreatePost };
