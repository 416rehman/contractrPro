"use client";

import {useUserStore} from "@/services/user/";
import {ReactNode} from "react";

type AuthSwitchProps = {
    fallbackIf: "logged-in" | "logged-out",
    to: ReactNode | ReactNode[] | null,
    children?: ReactNode | ReactNode[] | null,
    user?: any
}

/**
 * Renders content, but if the fallbackIf condition is met, renders the fallback instead.
 * This is used for authentication/authorization purposes such as redirecting to the login page if the user is not logged in.
 * The server-side version of this component is AuthSwitchServer.
 */
export default function AuthFallback({fallbackIf, to, children, user}: AuthSwitchProps) {
    const saved_user = useUserStore(state => state.user);
    if (!user) {
        user = saved_user;
    } else {
        // if the user is passed in as a prop, update the store
        useUserStore.getState().setUser(user);
        console.log("User received from server, stored in the store", user);
    }

    return (
        <>
            {(user?.id && fallbackIf === "logged-in") || (!user?.id && fallbackIf === "logged-out") ? to : children}
        </>
    );
}