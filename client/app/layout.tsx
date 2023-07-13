import "@/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import clsx from "clsx";
import { ReactNode } from "react";
import ToastBox from "@/components/toastBox";
import AuthFallback from "@/components/authFallback";
import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";

export const metadata = {
  title: "ContractrPro"
};

export default async function RootLayout({ children }: { children: ReactNode; }) {
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
    <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
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