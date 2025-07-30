"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import { getErrorMessage } from "@/lib/error";
import { CreatePostInput, createPostSchema } from "@/server/schema/post.schema";
import { Button } from "@/components/ui/button";
import { FormProvider, InputField } from "@/components/form";
import { MdEditor } from "@/components/ui/mdEditor";
import { ErrorMessage } from "@/components/ui/errorMessage";

const useCreatePost = () => {
  const router = useRouter();
  const { session, isLoadingSession } = useAuth();

  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const { mutate: createPost, isPending: isSubmitting } =
    trpc.post.create.useMutation({
      onSuccess: (data) => {
        setErrorMessage(null);
        router.push(`/post/${data.id}`);
      },
      onError: (error) => {
        const errorMessage = getErrorMessage(error.message);
        setErrorMessage(errorMessage);
      }
    });

  useEffect(() => {
    if (!isLoadingSession && !session) {
      router.push("/auth/login");
    }
  }, [isLoadingSession, session, router]);

  const onSubmit = async (data: CreatePostInput) => {
    setErrorMessage(null);

    createPost(data);
  };

  return {
    onSubmit,
    errorMessage,
    isSubmitting
  };
};

const CreatePostForm = () => {
  const { onSubmit, isSubmitting, errorMessage } = useCreatePost();

  return (
    <FormProvider schema={createPostSchema} onSubmit={onSubmit}>
      <InputField name="title" label="Title" placeholder="Enter post title" />
      <InputField name="content" label="Content">
        <MdEditor preview="live" />
      </InputField>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating Post..." : "Create Post"}
      </Button>
      <ErrorMessage error={errorMessage} />
    </FormProvider>
  );
};

export { CreatePostForm };
