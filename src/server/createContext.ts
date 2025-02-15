import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

const createContext = async (opts: FetchCreateContextFnOptions) => {
  const user = {
    id: 1,
    email: "teste@test.com",
  };

  return {
    user,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

export { createContext };
export type { Context };
