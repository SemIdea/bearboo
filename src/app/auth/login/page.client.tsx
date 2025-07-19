"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";

const useLoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login({ email, password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit
  };
};

export { useLoginForm };
