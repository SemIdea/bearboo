"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import MDEditor from "@uiw/react-md-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Create Post</CardTitle>
        <CardDescription>
          Fill in the details below to create a new post
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePost}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                required
                name="title"
                placeholder="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <MDEditor
                className="markdown markdown-editor"
                preview="live"
                value={content}
                onChange={(v) => {
                  setContent(v || "");
                }}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Creating Post..." : "Create Post"}
              </Button>
              {successMessage && (
                <p className="text-green-600 text-sm text-center">
                  {successMessage}
                </p>
              )}
              {errorMessage && (
                <p className="text-red-600 text-sm text-center">
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { CreatePostForm };
