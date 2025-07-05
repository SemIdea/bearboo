"use client";

import { useLoginForm } from "./page.client";

const Login = () => {
  const { email, setEmail, password, setPassword, handleSubmit, isLoading } =
    useLoginForm();

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1>Login</h1>

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
    </div>
  );
};

export default Login;
