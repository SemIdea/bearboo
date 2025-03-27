"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Authprovider } from "@/context/auth";
import TrpcProvider from "@/context/trpc";
import { PostProvider } from "@/context/post";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <TrpcProvider>
          <Authprovider>
            <PostProvider>{children}</PostProvider>
          </Authprovider>
        </TrpcProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
