// trpcProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink, TRPCClientError } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { AuthErrorCode } from "@/shared/error/auth";
import { TRPCError } from "@trpc/server";

let trpcClientInstance: ReturnType<typeof trpc.createClient>;

const refreshSessionDirect = async (refreshToken: string) => {
  try {
    // Use the TRPC client's mutation method directly.
    const data = await trpcClientInstance.auth.refreshSession.mutate({
      refreshToken,
    });

    document.cookie = `accessToken=${data.accessToken}; path=/;`;
    localStorage.setItem("refreshToken", data.refreshToken);
    return true;
  } catch (err) {
    console.error("Failed to refresh session:", err);
    return false;
  }
};

const handleRetry = async (
  failureCount: number,
  error: unknown
): Promise<boolean> => {
  if (failureCount > 1) return false;

  console.log("error", error);

  if (error instanceof TRPCClientError) {
    const message = error.message;
    console.log(message);

    switch (message) {
      case AuthErrorCode.INVALID_TOKEN:
        // remove cookies and redirect to login
        return false;

      case AuthErrorCode.SESSION_EXPIRED: {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return false;
        // Await the refresh call
        const refreshed = await refreshSessionDirect(refreshToken);
        return refreshed;
      }
      default:
        return failureCount < 3;
    }
  }

  return failureCount < 3;
};

export const fetcher = async (
  info: RequestInfo | URL,
  options: RequestInit | RequestInit | undefined
) => {
  const response = await fetch(info, options);

  // response
  // [
  //   {
  //     error: {
  //       json: {
  //         message: "SESSION_EXPIRED",
  //         code: -32001,
  //         data: {
  //           code: "UNAUTHORIZED",
  //           httpStatus: 401,
  //           stack:
  //             "TRPCError: SESSION_EXPIRED\n    at use[publicProcedure] (webpack-internal:///(rsc)/./src/server/createRouter.ts:58:19)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\n    at async callRecursive (webpack-internal:///(rsc)/./node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:151:24)\n    at async procedure (webpack-internal:///(rsc)/./node_modules/@trpc/server/dist/unstable-core-do-not-import/procedureBuilder.mjs:184:24)\n    at async eval (webpack-internal:///(rsc)/./node_modules/@trpc/server/dist/unstable-core-do-not-import/http/resolveResponse.mjs:262:30)\n    at async Promise.all (index 0)\n    at async resolveResponse (webpack-internal:///(rsc)/./node_modules/@trpc/server/dist/unstable-core-do-not-import/http/resolveResponse.mjs:502:26)\n    at async fetchRequestHandler (webpack-internal:///(rsc)/./node_modules/@trpc/server/dist/adapters/fetch/fetchRequestHandler.mjs:41:12)\n    at async AppRouteRouteModule.do (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:10:33313)\n    at async AppRouteRouteModule.handle (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/compiled/next-server/app-route.runtime.dev.js:10:40382)\n    at async doRender (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:1455:42)\n    at async responseGenerator (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:1814:28)\n    at async DevServer.renderToResponseWithComponentsImpl (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:1824:28)\n    at async DevServer.renderPageComponent (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:2240:24)\n    at async DevServer.renderToResponseImpl (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:2278:32)\n    at async DevServer.pipeImpl (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:960:25)\n    at async NextNodeServer.handleCatchallRenderRequest (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/next-server.js:281:17)\n    at async DevServer.handleRequestImpl (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/base-server.js:853:17)\n    at async /home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/dev/next-dev-server.js:373:20\n    at async Span.traceAsyncFn (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/trace/trace.js:153:20)\n    at async DevServer.handleRequest (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/dev/next-dev-server.js:370:24)\n    at async invokeRender (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/lib/router-server.js:183:21)\n    at async handleRequest (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/lib/router-server.js:360:24)\n    at async requestHandlerImpl (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/lib/router-server.js:384:13)\n    at async Server.requestListener (/home/codork/Documents/Github/blog-portifolio/node_modules/next/dist/server/lib/start-server.js:142:13)",
  //           path: "auth.test",
  //           zodError: null,
  //         },
  //       },
  //     },
  //   },
  // ];

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log("refreshToken", refreshToken);
    if (!refreshToken) {
      // navigate to login
      return response;
    }

    try {
      const data = await trpcClientInstance.auth.refreshSession.mutate({
        refreshToken,
      });
      
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);

      console.log("data", data);

      return await fetch(info, {
        ...options,
        headers: {
          ...options?.headers,
        },
      });
    } catch (error) {
      console.log("error", error);
      // navigate to login
      // storage.removeRefreshToken();
      return response;
    }
  }

  return response;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      // retry: handleRetry,
    },
  },
});

export default function TrpcProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const url =
    process.env.NEXT_PUBLIC_APP_DOMAIN &&
    !process.env.NEXT_PUBLIC_APP_DOMAIN.includes("localhost")
      ? `https://www.${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/trpc/`
      : "http://localhost:3000/api/trpc/";

  const [client] = useState(() => {
    const client = trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        httpBatchLink({
          transformer: superjson,
          url: "/api/trpc",
          fetch: fetcher,
        }),
      ],
    });
    // Save a reference for our direct calls.
    trpcClientInstance = client;
    return client;
  });

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
