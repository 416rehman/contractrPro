"use client";

import { useUserStore } from "@/state/user";
import { ReactNode, useEffect } from "react";

type AuthSwitchProps = {
  contentIfLoggedIn?: ReactNode | ReactNode[] | null;
  contentIfLoggedOut?: ReactNode | ReactNode[] | null;
}

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