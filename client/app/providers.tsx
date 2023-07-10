"use client";

import * as React from "react";
import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useUserStore } from "@/state/user";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const userStore = useUserStore((state) => state);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!userStore.user && refreshToken) {
      userStore.refresh().then(() => {
        console.log("refreshed token");
      });
    }
  }, [userStore]);

  return (
    <NextUIProvider>
      <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
    </NextUIProvider>
  );
}