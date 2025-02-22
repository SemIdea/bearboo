"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { AuthError } from "@/shared/error/auth";
import { trpc } from "@/app/_trpc/client";

type IErrorHandlers = {
  [key: string]: () => void;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 1000 } },
});

const extractError = (data: any) => {
  if (!data) return null;
  if (Array.isArray(data)) return data.find((res: any) => res.error)?.error;

  return data.error;
};

const errorHandlers: IErrorHandlers = {
  [AuthError.INVALID_TOKEN]: () => {
    console.log("Invalid token");
  },
  [AuthError.SESSION_EXPIRED]: () => {
    console.log("Session expired aa");
  },
};

const refreshToken = async () => {
  const response = await fetch("/api/auth/refresh-token", {
    credentials: "include",
  });

  if (response.ok) {
    return response.json();
  }

  const data = await response.json();
  const error = extractError(data);

  if (error) {
    console.log(error.message);
  }
};

const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await fetch(input, {
    ...init,
    credentials: "include",
  });

  const data = await response.json();

  if (response.ok) {
    return data;
  }

  const error = extractError(data);

  if (error) {
    const handler = errorHandlers[error.message];

    if (handler) {
      handler();
    }
  }
};

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
          headers() {
            const h = new Map();

            // h.set("x-trpc-source", "nextClient");
            // const sessionCookie = getClientSession();
            // if (sessionCookie) {
            //     h.set('authorization', `Bearer ${sessionCookie}`);
            // }
            return Object.fromEntries(h);
          },
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
