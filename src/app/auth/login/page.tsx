"use client";

import { useLoginForm } from "./page.client";

const Login = () => {
  const { email, setEmail, password, setPassword, handleSubmit } =
    useLoginForm();

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
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;
