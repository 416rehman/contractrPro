import { ReactNode } from "react";
import { getUserViaCookies } from "@/services/server/getUserViaCookies";
import AuthFallback from "@/components/authFallback";

type AuthSwitchProps = {
  contentIfLoggedIn?: ReactNode | ReactNode[] | null;
  contentIfLoggedOut?: ReactNode | ReactNode[] | null;
}

// Uses the signedInUser store to determine if the signedInUser is logged in or not and renders the appropriate content

export default async function AuthSwitchServer({ contentIfLoggedIn, contentIfLoggedOut }: AuthSwitchProps) {
  let user;
  try {
    user = await getUserViaCookies();
  } catch (err) {
    console.log("Error getting user", err);
  }

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