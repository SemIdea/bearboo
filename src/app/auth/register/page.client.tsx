"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";

const useRegisterForm = () => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    register({ email, password });
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit
  };
};

export { useRegisterForm };
