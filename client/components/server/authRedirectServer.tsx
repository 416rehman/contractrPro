/**
 * A server-side component that redirects the signedInUser to a page if they are logged in or logged out
 */

import { ReactNode } from "react";
import { user } from "@/app/layout";
import { redirect } from "next/navigation";
import AuthRedirect from "@/components/authRedirect";

type AuthSwitchProps = {
  // Redirect if logged in or logged out
  redirectIf: "logged-in" | "logged-out";
  // The page to redirect to
  to: string;
  // Otherwise render this
  children?: ReactNode | ReactNode[] | null;
}

/**
 * Redirects the signedInUser to a page if they are logged in or logged out
 * @param to
 * @param children
 * @param redirectIf
 * @example <AuthRedirectServer to={"/"} if={"logged-in"}>...</AuthRedirectServer> // Redirects to "/" if logged in, otherwise renders children
 * @example <AuthRedirectServer to={"/"} if={"logged-out"}>...</AuthRedirectServer> // Redirects to "/" if logged out, otherwise renders children
 */
export default async function AuthRedirectServer({ to, children, redirectIf }: AuthSwitchProps) {
  try {
    if (redirectIf == "logged-in" && user?.id) {
      redirect(to);
    } else if (redirectIf == "logged-out" && !user) {
      redirect(to);
    }
  } catch (err) {
    console.log("To redirect", to);
    console.log("Redirect if", redirectIf);
    console.log("Children", children);
    console.log(err.message || "Error getting loggedInUser", err);
  }

  return <AuthRedirect redirectIf={redirectIf} to={to}>{children}</AuthRedirect>;
}