import "@/globals.css";
import { fontSans } from "@/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import { ReactNode } from "react";
import ToastBox from "@/components/toastBox";
import AuthFallback from "@/components/authFallback";
import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";
import { cookies } from "next/headers";
import jwtDecode from "jwt-decode";
import { getNewAccessToken } from "@/services/auth";

export const metadata = {
  title: "ContractrPro"
};

// The user is populated on the server via getUserViaCookies and used by other components such as AuthRedirectServer etc
// It is used to check if the user is authenticated on the server side. On client side we use the auth and user services
export let user = null;

const getUserViaCookies = async (accessTokenCookieName = "accessToken", refreshTokenCookieName = "refreshToken") => {
  const tokenCookie = cookies().get(accessTokenCookieName || "token");

  let accessToken = tokenCookie?.value || null;
  if (accessToken) {
    const user: any = jwtDecode(accessToken);
    if (user?.exp * 1000 > Date.now() && user?.id) {
      return user;
    }
  }

  // if we get here, the access token is invalid or missing
  // do we have a refresh token?
  const refreshTokenCookie = cookies().get(refreshTokenCookieName || "refreshToken");
  const refreshToken = refreshTokenCookie?.value || null;
  if (refreshToken) {
    // we have a refresh token, use it to get a new access token
    accessToken = await getNewAccessToken(refreshToken);
    if (accessToken) {
      const user: any = jwtDecode(accessToken);
      if (user?.exp * 1000 > Date.now() && user?.id) {
        return user;
      }
    }
  }

  // otherwise, return null
  return null;
};

export default async function RootLayout({ children }: { children: ReactNode; }) {
  try {
    user = await getUserViaCookies();
  } catch (err) {
    console.log("Error getting user", err);
  }

  return (
    <html lang="en" suppressHydrationWarning>
    <link
      rel="icon"
      href="/icon.svg"
      type="image/svg+xml"
      sizes="any"
    />
    <body
      className={clsx(
        "bg-background font-sans antialiased min-h-screen min-w-screen flex flex-col",
        fontSans.variable
      )}
    >
    <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }} loggedInUser={user}>
      <div className="relative flex flex-col flex-grow w-full h-full">
        <Topbar />
        <div className="flex flex-row gap-x-0 gap-y-0 flex-grow w-full h-full">
          <AuthFallback fallbackIf={"logged-in"}
                        to={<Sidebar className={"hidden sm:flex sm:flex-col px-2 py-4 items-center gap-8"} />} />

          <main id={"main"}
                className="flex flex-grow border-foreground-100 sm:border-t-2 sm:border-l-2 rounded-tl-md bg-foreground-50 w-full h-auto">
            {children}
            <ToastBox className={"fixed bottom-0 right-0 z-50 p-4"} />
          </main>
        </div>
      </div>
    </Providers>
    </body>
    </html>
  );
}