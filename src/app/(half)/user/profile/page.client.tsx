"use client";

import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { IUserWithSession } from "@/server/entities/user/DTO";
import { useState } from "react";
import { FormBase, InputField } from "@/components/formBase";
import {
  UpdateUserProfileInput,
  updateUserProfileSchema
} from "@/server/schema/user.schema";
import { MdEditor } from "@/components/ui/mdEditor";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { getErrorMessage } from "@/lib/error";

const useUpdateUser = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const { mutate: updateUser } = trpc.user.update.useMutation({
    onSuccess: () => {
      setSuccessMessage("User updated successfully!");
      setErrorMessage(null);
      setIsUploading(false);
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error.message));
      setSuccessMessage(null);
      setIsUploading(false);
    }
  });

  const handleUpdateUser = (data: UpdateUserProfileInput) => {
    setIsUploading(true);

    updateUser(data);
  };

  return {
    handleUpdateUser,
    isUploading,
    successMessage,
    errorMessage
  };
};

const UpdateUserForm = ({ user }: { user: IUserWithSession }) => {
  const { handleUpdateUser, isUploading, successMessage, errorMessage } =
    useUpdateUser();

  return (
    <FormBase
      schema={updateUserProfileSchema}
      onSubmit={handleUpdateUser}
      defaultValues={{ ...user }}
    >
      <InputField name="name" label="Name" placeholder="John Doe" />
      <InputField name="email" label="Email" placeholder="m@example.com" />
      <InputField name="bio" label="Bio">
        <MdEditor preview="live" />
      </InputField>
      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? "Updating..." : "Update Profile"}
      </Button>
      <ErrorMessage error={errorMessage} />
      {successMessage && (
        <div className="text-green-600 mt-2">{successMessage}</div>
      )}
    </FormBase>
  );
};

export { UpdateUserForm };
