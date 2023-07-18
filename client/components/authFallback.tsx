"use client";

import { useUserStore } from "@/services/user/";
import { ReactNode } from "react";

type AuthSwitchProps = {
  fallbackIf: "logged-in" | "logged-out";
  to: ReactNode | ReactNode[] | null;
  children?: ReactNode | ReactNode[] | null;
}

/**
 * Renders content, but if the fallbackIf condition is met, renders the fallback instead.
 * This is used for authentication/authorization purposes such as redirecting to the login page if the user is not logged in.
 * The server-side version of this component is AuthSwitchServer.
 */
export default function AuthFallback({ fallbackIf, to, children }: AuthSwitchProps) {
  const user = useUserStore(state => state.user);

  return (
    <>
      {(user?.id && fallbackIf === "logged-in") || (!user?.id && fallbackIf === "logged-out") ? to : children}
    </>
  );
}