"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";

const Register = () => {
  const { register } = useAuth();

  const [email, setEmail] = useState(`user${Date.now()}@example.com`);
  const [password, setPassword] = useState(`pass${Date.now()}`);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    register({
      email,
      password
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Username"
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
