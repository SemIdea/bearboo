import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { NextRequest } from "next/server";
import { createTRPCContext } from "@/server/createContext";
import { appRouter } from "@/server/routers/app.routes";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    // onError: IS_DEVELOPMENT
    //   ? ({ path, error }) => {
    //       console.error(
    //         `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
    //       );
    //     }
    //   : undefined,
  });
};

export { handler as GET, handler as POST };
