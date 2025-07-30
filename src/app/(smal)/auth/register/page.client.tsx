"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/error";
import { FormBase, InputField } from "@/components/formBase";
import {
  CreateUserInput,
  registerUserSchema
} from "@/server/schema/user.schema";
import { ErrorMessage } from "@/components/ui/errorMessage";

const useRegisterForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => {
      router.push(
        `/auth/check-email?email=${encodeURIComponent(data.user.email)}`
      );
      setIsLoading(false);
      setErrorMessage("");
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error.message));
      setIsLoading(false);
    }
  });

  const handleSubmit = async (data: CreateUserInput) => {
    setIsLoading(true);
    setErrorMessage("");

    register(data);
  };

  return {
    isLoading,
    errorMessage,
    handleSubmit
  };
};

const RegisterForm = () => {
  const { isLoading, errorMessage, handleSubmit } = useRegisterForm();

  return (
    <FormBase schema={registerUserSchema} onSubmit={handleSubmit}>
      <InputField
        name="email"
        label="Email"
        type="email"
        placeholder="m@example.com"
      />
      <InputField name="name" label="Name" type="text" placeholder="John Doe" />
      <InputField
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
      <ErrorMessage error={errorMessage} />
    </FormBase>
  );
};

export { RegisterForm };
