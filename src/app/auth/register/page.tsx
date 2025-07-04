"use client";

import { useRegisterForm } from "./page.client";

const Register = () => {
  const { email, setEmail, password, setPassword, handleSubmit } =
    useRegisterForm();

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
