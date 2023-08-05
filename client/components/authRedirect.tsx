"use client";

import { useUserStore } from "@/services/user/";
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
 * Redirects the signedInUser to a page if they are logged in or logged out.
 * Functions similarly to AuthFallback, but redirects instead of rendering a fallback.
 * @example `<AuthRedirectServer to={"/"} if={"logged-in"}>...</AuthRedirectServer>` Redirects to `/` if logged in, otherwise renders children
 * @example `<AuthRedirectServer to={"/"} if={"logged-out"}>...</AuthRedirectServer>` Redirects to `/` if logged out, otherwise renders children
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