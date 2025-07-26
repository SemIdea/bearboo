"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import { extractErrorMessage, getErrorMessage } from "@/lib/error";
import { ValidationErrorCode } from "@/shared/error/validation";
import { useClientValidation } from "@/lib/validation";
import dynamic from "next/dynamic";
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

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false
});

type PostData = {
  title: string;
  content: string;
};

const useCreatePost = () => {
  const router = useRouter();
  const { session, isLoadingSession } = useAuth();
  const { validatePost, validationError, clearValidationError } =
    useClientValidation();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");

  // Focus state tracking
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  // Clear error message when user starts typing
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errorMessage || validationError) {
      setErrorMessage(null);
      clearValidationError();
    }
  };

  const handleContentChange = (value: string | undefined) => {
    setContent(value || "");
    if (errorMessage || validationError) {
      setErrorMessage(null);
      clearValidationError();
    }
  };

  const { mutate: createPost } = trpc.post.create.useMutation({
    onSuccess: (data) => {
      setSuccessMessage("Post created successfully!");
      setErrorMessage(null);
      router.push(`/post/${data.id}`);
    },
    onError: (error) => {
      setErrorMessage(extractErrorMessage(error));
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

    // Client-side validation using the validation hook
    const isValid = validatePost(title, content);
    if (!isValid) {
      return; // Error message is already set by the validation hook
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
    content,
    isUploading,
    errorMessage: errorMessage || validationError, // Combine both error types
    successMessage,
    handleCreatePost,
    handleTitleChange,
    handleContentChange,
    titleFocused,
    contentFocused,
    setTitleFocused,
    setContentFocused
  };
};

const CreatePostForm = () => {
  const {
    title,
    content,
    isUploading,
    errorMessage,
    successMessage,
    handleCreatePost,
    handleTitleChange,
    handleContentChange,
    titleFocused,
    contentFocused,
    setTitleFocused,
    setContentFocused
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
                onChange={(e) => handleTitleChange(e.target.value)}
                onFocus={() => setTitleFocused(true)}
                onBlur={() => setTitleFocused(false)}
                autoComplete="off"
                className={
                  title.length > 0 && title.length < 3 && !titleFocused
                    ? "border-red-300"
                    : ""
                }
              />
              {title.length > 0 && title.length < 3 && !titleFocused && (
                <p className="text-red-600 text-xs">
                  {getErrorMessage(
                    ValidationErrorCode.POST_TITLE_TOO_SHORT_CLIENT
                  )}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <MDEditor
                className="markdown markdown-editor"
                preview="live"
                value={content}
                onChange={handleContentChange}
                onFocus={() => setContentFocused(true)}
                onBlur={() => setContentFocused(false)}
              />
              {content.length > 0 && content.length < 10 && !contentFocused && (
                <p className="text-red-600 text-xs">
                  {getErrorMessage(
                    ValidationErrorCode.POST_CONTENT_TOO_SHORT_CLIENT
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm">{errorMessage}</p>
                </div>
              )}
              {successMessage && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? "Creating Post..." : "Create Post"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export { CreatePostForm };
