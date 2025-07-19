"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { clearAuthData } from "@/utils/authStorage";
import { TRPCError } from "@trpc/server";

let trpcClientInstance: ReturnType<typeof trpc.createClient>;

export const fetcher = async (
  info: RequestInfo | URL,
  options: RequestInit | RequestInit | undefined
) => {
  const response = await fetch(info, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      clearAuthData();
      window.location.href = "/auth/login";

      return response;
    }

    const data = await trpcClientInstance.auth.refreshSession
      .mutate({
        refreshToken
      })
      .catch((error) => {
        clearAuthData();
        window.location.href = "/auth/login";
        throw error;
      });

    document.cookie = `accessToken=${data.accessToken}; path=/;`;
    localStorage.setItem("refreshToken", data.refreshToken);

    return await fetch(info, {
      ...options,
      headers: {
        ...options?.headers
      }
    });
  }

  return response;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000
    }
  }
});

const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  const url =
    process.env.NEXT_PUBLIC_APP_DOMAIN &&
    !process.env.NEXT_PUBLIC_APP_DOMAIN.includes("localhost")
      ? `https://www.${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/trpc/`
      : "http://localhost:3000/api/trpc/";

  const [client] = useState(() => {
    const client = trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true
        }),
        httpBatchLink({
          transformer: superjson,
          url: "/api/trpc",
          fetch: fetcher
        })
      ]
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
};

export default TrpcProvider;
