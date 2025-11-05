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
import { useAuth } from "@/context/auth";

const useRegisterForm = () => {
  const router = useRouter();
  const { updateAuthData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registerData, setRegisterData] = useState<{
    email: string;
    name: string;
    password: string;
  } | null>(null);

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

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => {
      // router.push(
      //   `/auth/verify?email=${encodeURIComponent(data.user.email)}`
      // );
      login({
        email: registerData?.email || "",
        password: registerData?.password || ""
      });
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
    setRegisterData(data);
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
