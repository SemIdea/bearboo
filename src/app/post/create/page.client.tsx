"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import MDEditor from "@uiw/react-md-editor";

type PostData = {
  title: string;
  content: string;
};

const useCreatePost = () => {
  const router = useRouter();
  const { session, isLoadingSession } = useAuth();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const { mutate: createPost } = trpc.post.create.useMutation({
    onSuccess: (data) => {
      setSuccessMessage("Post created successfully!");
      setErrorMessage(null);
      router.push(`/post/${data.id}`);
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

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title || !content) {
      return alert("Title and content are required.");
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    createPost({
      title,
      content
    } as PostData);
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    isUploading,
    errorMessage,
    successMessage,
    handleCreatePost
  };
};

const CreatePostForm = () => {
  const {
    title,
    setTitle,
    content,
    setContent,
    isUploading,
    errorMessage,
    successMessage,
    handleCreatePost
  } = useCreatePost();

  return (
    <>
      <form onSubmit={handleCreatePost}>
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
        <MDEditor
          hideToolbar
          className="markdown w-[800px]"
          preview="live"
          value={content}
          onChange={(v) => {
            setContent(v || "");
          }}
        />
        <button type="submit">Create Post</button>
      </form>
      {isUploading && <p>Uploading...</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </>
  );
};

export { CreatePostForm };
