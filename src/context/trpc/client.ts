import { httpBatchLink, loggerLink } from "@trpc/react-query";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { customFetcher } from "./fetcher";

export const createTRPCClient = () => {
  return trpc.createClient({
    links: [
      loggerLink({
        enabled: () => true
      }),
      httpBatchLink({
        transformer: superjson,
        url: "/api/trpc",
        fetch: customFetcher
      })
    ]
  });
};
