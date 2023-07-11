"use client";

import * as React from "react";
import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useUserStore } from "@/state/user";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const userStore = useUserStore((state) => state);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!userStore.user && refreshToken) {
      userStore.refresh().then(() => {
        console.log("refreshed token");
      }).finally(() => {
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }

  }, [userStore]);

  return (
    <NextUIProvider>
      <NextThemesProvider {...themeProps}>
        {isLoaded ? children :
          <div className="flex flex-col items-center justify-center h-screen w-screen">
            <LoadingSpinner />
          </div>
        }
      </NextThemesProvider>
    </NextUIProvider>
  );
}