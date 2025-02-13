import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const createContext = async (opts: CreateNextContextOptions) => {
  const user = {
    id: 1,
    email: "teste@test.com",
  };

  return {
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
