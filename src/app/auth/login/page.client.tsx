"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";
import Link from "next/link";
import { getErrorMessage } from "@/lib/getErrorMessage";

const useLoginForm = () => {
  const router = useRouter();
  const { updateAuthData } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { mutate: login } = trpc.auth.loginUser.useMutation({
    onSuccess: (data) => {
      updateAuthData(data);
      router.push("/");
      setIsLoading(false);
      setErrorMessage("");
    },
    onError: (error) => {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Login failed. Please try again.");
      setIsLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    login({ email, password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    isLoading,
    errorMessage
  };
};

const LoginForm = ({ className, ...props }: React.ComponentProps<"div">) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    isLoading,
    errorMessage
  } = useLoginForm();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-none">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
                {errorMessage && (
                  <p className="text-red-600 text-sm text-center">
                    {getErrorMessage(errorMessage)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export { LoginForm };
