"use client";

import * as React from "react";
import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useUserStore } from "@/services/user/";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  loggedInUser: any;
}

export function Providers({ children, themeProps, loggedInUser }: ProvidersProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [setUser] = useUserStore(state => [state.setUser]);

  useEffect(() => {
    setIsLoaded(false);
    setUser(loggedInUser);
    setIsLoaded(true);
  }, [loggedInUser, setUser]);

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