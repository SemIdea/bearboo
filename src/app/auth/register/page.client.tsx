"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_trpc/client";

const useRegisterForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: register } = trpc.auth.registerUser.useMutation({
    onSuccess: (data) => {
      router.push(
        `/auth/check-email?email=${encodeURIComponent(data.user.email)}`
      );
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Registration error:", error);
      setIsLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

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
    isLoading
  };
};

const RegisterForm = () => {
  const {
    email,
    setEmail,
    name,
    setName,
    password,
    setPassword,
    handleSubmit,
    isLoading
  } = useRegisterForm();

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
        placeholder="Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
        {isLoading ? "Creating Account..." : "Register"}
      </button>
    </form>
  );
};

export { RegisterForm };
