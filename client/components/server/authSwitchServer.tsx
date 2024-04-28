import { ReactNode } from "react";
import AuthFallback from "@/components/authFallback";
import {getUserViaCookies} from "@/app/layout";

type AuthSwitchProps = {
  contentIfLoggedIn?: ReactNode | ReactNode[] | null;
  contentIfLoggedOut?: ReactNode | ReactNode[] | null;
}

// Uses the signedInUser store to determine if the signedInUser is logged in or not and renders the appropriate content

export default async function AuthSwitchServer({ contentIfLoggedIn, contentIfLoggedOut }: AuthSwitchProps) {
  const user = await getUserViaCookies(); // Get user from the stored cookies on their browser
  return (
    <>
      {user?.id ?
        <AuthFallback fallbackIf={"logged-out"} to={contentIfLoggedOut}>
          {contentIfLoggedIn}
        </AuthFallback>
        :
        <AuthFallback fallbackIf={"logged-in"} to={contentIfLoggedIn}>
          {contentIfLoggedOut}
        </AuthFallback>
      }
    </>
  );
}