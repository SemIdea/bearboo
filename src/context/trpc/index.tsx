"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { clearAuthData } from "@/utils/authStorage";

let trpcClientInstance: ReturnType<typeof trpc.createClient>;

// Track ongoing refresh attempts to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

export const fetcher = async (
  info: RequestInfo | URL,
  options: RequestInit | undefined
): Promise<Response> => {
  let hasRetried = false;

  try {
    let response = await fetch(info, options);

    // If we get a 401 (unauthorized), try to refresh the token and retry once
    if (response.status === 401 && !hasRetried) {
      hasRetried = true;

      // Check if we're already refreshing to prevent race conditions
      if (isRefreshing && refreshPromise) {
        try {
          await refreshPromise;
        } catch {
          clearAuthData();
          window.location.href = "/auth/login";
          return response;
        }
      } else {
        // Start refresh process
        isRefreshing = true;
        refreshPromise = refreshTokens();

        try {
          await refreshPromise;
        } catch (error) {
          clearAuthData();
          window.location.href = "/auth/login";
          return response;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      }

      // Retry the original request with new tokens
      response = await fetch(info, options);
    }

    // After handling 401 and potential retry, check for other status codes
    if (response.status === 401) {
      // Still 401 after retry, redirect to login
      clearAuthData();
      window.location.href = "/auth/login";
    } else if (response.status === 403) {
      // User not verified, redirect to verification
      window.location.href = "/auth/verify";
    }

    return response;
  } catch (error) {
    // Handle network errors
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
};

// Separate function for token refresh logic
const refreshTokens = async (): Promise<void> => {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("Cannot refresh tokens in server environment");
  }

  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  if (!trpcClientInstance) {
    throw new Error("TRPC client not initialized");
  }

  try {
    const data = await trpcClientInstance.auth.refreshSession.mutate({
      refreshToken
    });

    // Update tokens
    document.cookie = `accessToken=${data.accessToken}; path=/; secure; samesite=strict`;
    localStorage.setItem("refreshToken", data.refreshToken);
  } catch (error) {
    // Clear tokens on refresh failure
    clearAuthData();
    throw error;
  }
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

    // Save reference for direct calls
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
