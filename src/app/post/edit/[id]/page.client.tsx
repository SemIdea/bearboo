"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import { IPostEntity } from "@/server/entities/post/DTO";

const useUpdatePost = (post: IPostEntity) => {
  const router = useRouter();
  const { id } = post;
  const { session, isLoadingSession } = useAuth();

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const { mutate: revalidatePost } = trpc.post.revalidate.useMutation();

  const { mutate: updatePost } = trpc.post.update.useMutation({
    onSuccess: () => {
      revalidatePost({
        id
      });
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
    }
  });

  const { mutate: deletePost } = trpc.post.delete.useMutation({
    onSuccess: () => {
      setSuccessMessage("Post deleted successfully!");
      setErrorMessage(null);
      router.push("/");
    },
    onError: (error) => {
      setErrorMessage("Failed to delete post. Please try again.");
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

  const handleUpdatePost = async (
    postData: React.FormEvent<HTMLFormElement>
  ) => {
    postData.preventDefault();
    setIsUploading(true);

    updatePost({
      title,
      content,
      id
    });
  };

  const handleDeletePost = async () => {
    if (!session)
      return setErrorMessage("You must be logged in to update a post.");

    if (!id) return setErrorMessage("Post ID is required to update a post.");

    setIsUploading(true);

    deletePost({
      id
    });
  };

  return {
    title,
    content,
    isUploading,
    successMessage,
    errorMessage,
    setTitle,
    setContent,
    handleUpdatePost,
    handleDeletePost
  };
};

const UpdatePostForm = ({ post }: { post: IPostEntity }) => {
  const {
    title,
    content,
    isUploading,
    errorMessage,
    successMessage,
    setTitle,
    setContent,
    handleUpdatePost,
    handleDeletePost
  } = useUpdatePost(post);

  return (
    <>
      <form onSubmit={handleUpdatePost}>
        <input
          required
          name="title"
          placeholder="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <br />
        <textarea
          required
          name="content"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" disabled={isUploading}>
          {isUploading ? "Updating..." : "Edit Post"}
        </button>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
      </form>
      <button onClick={() => handleDeletePost()} disabled={isUploading}>
        {isUploading ? "Deleting..." : "Delete Post"}
      </button>
    </>
  );
};

export { UpdatePostForm };
