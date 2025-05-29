"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Authprovider } from "@/context/auth";
import TrpcProvider from "@/context/trpc";
import { PostProvider } from "@/context/post";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const Providers: React.FC<ProvidersProps> = ({ children, themeProps }) => {
  const router = useRouter();

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TrpcProvider>
        <Authprovider>
          <PostProvider>{children}</PostProvider>
        </Authprovider>
      </TrpcProvider>
    </NextThemesProvider>
  );
};

export { Providers };
