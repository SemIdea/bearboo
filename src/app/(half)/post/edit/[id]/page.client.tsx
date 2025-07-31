"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { trpc } from "@/app/_trpc/client";
import { IPostEntity } from "@/server/entities/post/DTO";
import { Button } from "@/components/ui/button";
import { MdEditor } from "@/components/ui/mdEditor";
import { FormBase, InputField } from "@/components/formBase";
import { UpdatePostInput, updatePostSchema } from "@/server/schema/post.schema";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { getErrorMessage } from "@/lib/error";

const useUpdatePost = (post: IPostEntity) => {
  const router = useRouter();
  const { id } = post;
  const { session, isLoadingSession } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);

  const { mutate: revalidatePost } = trpc.post.revalidate.useMutation();

  const { mutate: updatePost } = trpc.post.update.useMutation({
    onSuccess: () => {
      setErrorMessage(null);
      revalidatePost({
        id
      });
      setSuccessMessage("Post updated successfully!");
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(getErrorMessage(error.message));
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
      setErrorMessage(getErrorMessage(error.message));
      setSuccessMessage(null);
    },
    onSettled: () => {
      setIsDeleting(false);
    }
  });

  useEffect(() => {
    if (!isLoadingSession && !session) {
      router.push("/auth/login");
    }
  }, [isLoadingSession]);

  const handleCreate = async (data: UpdatePostInput) => {
    setErrorMessage(null);
    setIsUploading(true);

    updatePost(data);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    deletePost({
      id
    });
  };

  return {
    isUploading,
    isDeleting,
    successMessage,
    errorMessage,
    handleCreate,
    handleDelete
  };
};

const DeletePostButton = ({ post }: { post: IPostEntity }) => {
  const { handleDelete: handleDeletePost, isDeleting } = useUpdatePost(post);

  return (
    <Button
      variant="destructive"
      className="mt-2"
      onClick={handleDeletePost}
      disabled={isDeleting}
    >
      {isDeleting ? "Deleting Post..." : "Delete Post"}
    </Button>
  );
};

const UpdatePostForm = ({ post }: { post: IPostEntity }) => {
  const { isUploading, errorMessage, successMessage, handleCreate } =
    useUpdatePost(post);

  return (
    <FormBase
      schema={updatePostSchema}
      onSubmit={handleCreate}
      defaultValues={{ ...post }}
    >
      <InputField name="title" label="Title" placeholder="Enter post title" />
      <InputField name="content" label="Content">
        <MdEditor preview="live" />
      </InputField>
      <Button type="submit" disabled={isUploading}>
        {isUploading ? "Editing Post..." : "Edit Post"}
      </Button>
      <ErrorMessage error={errorMessage} />
      {successMessage && (
        <p className="text-green-600 text-sm text-center">{successMessage}</p>
      )}
    </FormBase>
  );
};

export { UpdatePostForm, DeletePostButton };
