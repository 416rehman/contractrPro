import "@/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Topbar } from "@/components/topbar";
import clsx from "clsx";
import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";
import ToastBox from "@/components/toastBox";

export const metadata = {
  title: "ContractrPro"
};

export default function RootLayout({
                                     children
                                   }: {
  children: ReactNode;
}) {
  const toastStore = useToastsStore(state => state);
  return (
    <html lang="en" suppressHydrationWarning>
    <body
      className={clsx(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}
    >
    <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
      <div className="relative flex flex-col h-screen">
        <Topbar />
        <div className="flex flex-row gap-x-0 gap-y-0 h-full">
          <Sidebar className={"hidden sm:flex sm:flex-col px-2 py-4 items-center gap-8"} />
          <main id={"main"}
                className="flex flex-grow border-foreground-100 sm:border-2 rounded-tl-md bg-foreground-50 w-full h-full">
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