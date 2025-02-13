import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { createContext } from "@/server/createContext";
import { appRouter } from "@/server/routers/app.routes";

const handler = (request: Request) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext,
  });
};

export { handler as GET, handler as POST };
