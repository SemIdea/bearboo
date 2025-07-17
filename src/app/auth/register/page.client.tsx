"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getErrorMessage } from "@/lib/getErrorMessage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const useRegisterForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
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
      console.error("Registration error:", error);
      setErrorMessage(
        error.message || "Registration failed. Please try again."
      );
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    register({ email, name, password });
  };

  return {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    handleSubmit,
    isLoading,
    errorMessage
  };
};

const RegisterForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    handleSubmit,
    isLoading,
    errorMessage
  } = useRegisterForm();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
                {errorMessage && (
                  <p className="text-red-600 text-sm text-center">
                    {getErrorMessage(errorMessage)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { RegisterForm };
