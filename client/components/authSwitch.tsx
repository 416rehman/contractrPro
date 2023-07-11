"use client";

import { useUserStore } from "@/state/user";
import { ReactNode, useEffect } from "react";

type AuthSwitchProps = {
  contentIfLoggedIn?: ReactNode | ReactNode[] | null;
  contentIfLoggedOut?: ReactNode | ReactNode[] | null;
}

// Uses the user store to determine if the user is logged in or not and renders the appropriate content
export default function AuthSwitch({ contentIfLoggedIn, contentIfLoggedOut }: AuthSwitchProps) {
  const user = useUserStore(state => state.user);
  useEffect(() => {
    console.log("User changed: ", user);
  }, [user]);

  return (
    <>
      {user ? contentIfLoggedIn : contentIfLoggedOut}
    </>
  );
}