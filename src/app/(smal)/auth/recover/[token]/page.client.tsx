"use client";

import { trpc } from "@/app/_trpc/client";
import { FormBase, InputField } from "@/components/formBase";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { getErrorMessage } from "@/lib/error";
import {
  ResetPasswordInput,
  resetPasswordSchema
} from "@/server/schema/resetPassword.schema";
import { useState } from "react";

const useResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: resetPassword } = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccessMessage(
        "Password reset successfully. You can now log in with your new password."
      );
      setErrorMessage("");
      setIsLoading(false);
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error.message));
      setSuccessMessage("");
      setIsLoading(false);
    }
  });

  const handleSubmit = (data: ResetPasswordInput) => {
    setIsLoading(true);
    resetPassword(data);
  };

  return {
    isLoading,
    successMessage,
    errorMessage,
    handleSubmit
  };
};

const ResetPasswordForm = ({ token }: { token: string }) => {
  const { isLoading, successMessage, errorMessage, handleSubmit } =
    useResetPassword();

  return (
    <FormBase
      schema={resetPasswordSchema}
      onSubmit={handleSubmit}
      defaultValues={{ token }}
    >
      <InputField
        name="password"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
      />
      <InputField
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Confirm your new password"
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
      {successMessage && (
        <div className="text-green-600 mt-4">{successMessage}</div>
      )}
      <ErrorMessage error={errorMessage} />
    </FormBase>
  );
};

export { ResetPasswordForm };
