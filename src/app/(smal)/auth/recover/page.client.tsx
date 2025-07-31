"use client";

import { trpc } from "@/app/_trpc/client";
import { FormBase, InputField } from "@/components/formBase";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/errorMessage";
import { getErrorMessage } from "@/lib/error";
import {
  SendResetPasswordEmailInput,
  sendResetPasswordEmailSchema
} from "@/server/schema/resetPassword.schema";
import { useState } from "react";

const useResetPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: resetPassword } =
    trpc.auth.sendResetPasswordEmail.useMutation({
      onSuccess: () => {
        setSuccessMessage("Recover password email sent successfully!");
        setIsSubmitting(false);
      },
      onError: (error) => {
        setErrorMessage(getErrorMessage(error.message));
        setIsSubmitting(false);
      }
    });

  const handleSubmit = (data: SendResetPasswordEmailInput) => {
    setIsSubmitting(true);
    resetPassword(data);
  };

  return {
    isSubmitting,
    successMessage,
    errorMessage,
    handleSubmit
  };
};

const SendResetPasswordEmailForm = () => {
  const { isSubmitting, successMessage, errorMessage, handleSubmit } =
    useResetPassword();

  return (
    <FormBase schema={sendResetPasswordEmailSchema} onSubmit={handleSubmit}>
      <InputField
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Recover Link"}
      </Button>
      {successMessage && (
        <p className="text-green-500">{successMessage}</p>
      )}
      <ErrorMessage error={errorMessage} />
    </FormBase>
  );
};

export { SendResetPasswordEmailForm };
