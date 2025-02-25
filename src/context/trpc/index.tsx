"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink, TRPCClientError } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { trpc } from "@/app/_trpc/client";
import { AuthErrorCode } from "@/shared/error/auth";

const handleRetry = (faliureCount: number, error: unknown): boolean => {
  if (faliureCount > 1) return false;
  const { mutate: refreshSession } = trpc.auth.refreshSession.useMutation({
    onSuccess(data) {
      document.cookie = `accessToken=${data.accessToken}; path=/;`;
      localStorage.setItem("refreshToken", data.refreshToken);
    },
  });

  if (error instanceof TRPCClientError) {
    const message = error.message;

    switch (message) {
      case AuthErrorCode.INVALID_TOKEN:
        // remove cookies redirect to login
        break;

      case AuthErrorCode.SESSION_EXPIRED:
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) return false;

        refreshSession({
          refreshToken,
        });

        break;

      default:
        return faliureCount < 3;
    }
  }

  return faliureCount < 3;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
      retry: handleRetry,
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

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: () => true,
        }),
        httpBatchLink({
          transformer: superjson,
          url: "/api/trpc",
          // headers() {
          //   const h = new Map();

          //   // h.set("x-trpc-source", "nextClient");
          //   // const sessionCookie = getClientSession();
          //   // if (sessionCookie) {
          //   //     h.set('authorization', `Bearer ${sessionCookie}`);
          //   // }
          //   return Object.fromEntries(h);
          // },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
