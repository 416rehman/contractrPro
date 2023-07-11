"use client";

import { useUserStore } from "@/state/user";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

type AuthSwitchProps = {
  // Redirect if logged in or logged out
  redirectIf: "logged-in" | "logged-out";
  // The page to redirect to
  to: string;
  // Otherwise render this
  children?: ReactNode | ReactNode[] | null;
}

/**
 * Redirects the user to a page if they are logged in or logged out
 * @param to
 * @param children
 * @param redirectIf
 * @example <AuthRedirect to={"/"} if={"logged-in"}>...</AuthRedirect> // Redirects to "/" if logged in, otherwise renders children
 * @example <AuthRedirect to={"/"} if={"logged-out"}>...</AuthRedirect> // Redirects to "/" if logged out, otherwise renders children
 */
export default function AuthRedirect({ to, children, redirectIf }: AuthSwitchProps) {
  const user = useUserStore(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (redirectIf === "logged-in" && user) {
      router.push(to);
    } else if (redirectIf === "logged-out" && !user) {
      router.push(to);
    }
  }, [user, redirectIf, router, to]);

  return (
    <>
      {children}
    </>
  );
}