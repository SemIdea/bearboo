"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { createTRPCClient } from "./client";
import { setTRPCClientInstance } from "./session";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000
    }
  }
});

const TrpcProvider = ({ children }: { children: React.ReactNode }) => {
  const [client] = useState(() => {
    const client = createTRPCClient();
    setTRPCClientInstance(client);
    return client;
  });

  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TrpcProvider;
