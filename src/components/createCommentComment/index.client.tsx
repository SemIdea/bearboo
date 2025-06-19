"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";

type Params = {
  id: string;
};

const useCreateComment = () => {
  const router = useRouter();
  const { id: postId } = useParams<Params>();

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const { mutate: createComment } = trpc.comment.createComment.useMutation({
    onSuccess: () => {
      setSuccessMessage("Comment created successfully!");
      setErrorMessage(null);
      router.push(`/post/${postId}`);
    },
    onError: (error) => {
      setErrorMessage("Failed to create comment. Please try again.");
      setSuccessMessage(null);
      console.error("Error creating comment:", error);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  return {
    createComment,
    postId,
    isUploading,
    errorMessage,
    successMessage
  };
};

export { useCreateComment };
