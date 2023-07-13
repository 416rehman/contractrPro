"use client";

import { useUserStore } from "@/state/user";
import { ReactNode } from "react";

type AuthSwitchProps = {
  fallbackIf: "logged-in" | "logged-out";
  to: ReactNode | ReactNode[] | null;
  children?: ReactNode | ReactNode[] | null;
}

// Renders content, but if the fallbackIf condition is met, renders the fallback instead

export default function AuthFallback({ fallbackIf, to, children }: AuthSwitchProps) {
  const user = useUserStore(state => state.user);

  return (
    <>
      {(user?.id && fallbackIf === "logged-in") || (!user?.id && fallbackIf === "logged-out") ? to : children}
    </>
  );
}