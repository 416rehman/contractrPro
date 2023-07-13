"use client";

import * as React from "react";
import { useEffect } from "react";
import { NextUIProvider } from "@nextui-org/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";
import { useUserStore } from "@/state/user";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { refreshUser } from "@/services/auth";
import { getUserOrganizations } from "@/services/user";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const user = useUserStore(state => state.user);

  // Initial render only so if the app loads for the first time, it will refresh the user data.
  // DO NOT ADD user TO THE DEPENDENCIES ARRAY OR IT WILL CAUSE AN INFINITE LOOP
  useEffect(() => {
    setIsLoaded(false);
    const fetchData = async () => {
      try {
        if (user?.id) {
          const newUser = await refreshUser();
          console.log("Got new user", newUser);
        }
      } catch (err) {
        console.log("Error refreshing user", err);
      }
    };

    fetchData().catch(err => console.log(err)).finally(() => setIsLoaded(true));
  }, []);

  // If the logged in user changes, get the organizations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoaded(false);

      try {
        if (user?.id) {
          console.log("User Id found, getting organizations");
          setIsLoaded(false);
          const orgs = await getUserOrganizations();
          console.log("Got organizations", orgs);
          setIsLoaded(true);
        }
      } catch (err) {
        console.log("Error getting organizations", err);
      }
    };

    fetchData().catch(err => console.log(err)).finally(() => setIsLoaded(true));
  }, [user?.id]);

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