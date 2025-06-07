"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Authprovider } from "@/context/auth";
import TrpcProvider from "@/context/trpc";
import { PostProvider } from "@/context/post";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
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
