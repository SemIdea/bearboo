"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/context/auth";

const useLoginForm = () => {
  const router = useRouter();
  const { updateAuthData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: login } = trpc.auth.loginUser.useMutation({
    onSuccess: (data) => {
      updateAuthData(data);
      router.push("/");
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    login({ email, password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
    isLoading
  };
};

const LoginForm = () => {
  const { email, setEmail, password, setPassword, handleSubmit, isLoading } =
    useLoginForm();

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export { LoginForm };
