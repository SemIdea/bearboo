"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import { getErrorMessage } from "@/lib/error";
import { FormProvider, InputField } from "@/components/form";
import { LoginUserInput, loginUserSchema } from "@/server/schema/user.schema";
import { ErrorMessage } from "@/components/ui/errorMessage";

const useLoginForm = () => {
  const router = useRouter();
  const { updateAuthData } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: login } = trpc.auth.loginUser.useMutation({
    onSuccess: (data) => {
      updateAuthData(data);
      setIsLoading(false);
      setErrorMessage("");
      router.push("/");
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error.message));
      setIsLoading(false);
    }
  });

  const handleSubmit = (data: LoginUserInput) => {
    setIsLoading(true);
    setErrorMessage("");

    login(data);
  };

  return {
    isLoading,
    errorMessage,
    handleSubmit
  };
};

const LoginForm = () => {
  const { isLoading, errorMessage, handleSubmit } = useLoginForm();

  return (
    <FormProvider schema={loginUserSchema} onSubmit={handleSubmit}>
      <InputField name="email" label="Email" placeholder="m@example.com" />
      <InputField
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
      />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Login"}
      </Button>
      <ErrorMessage error={errorMessage} />
    </FormProvider>
  );
};

export { LoginForm };
