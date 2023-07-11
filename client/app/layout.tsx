"use client";
import "@/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Topbar } from "@/components/topbar";
import clsx from "clsx";
import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";
import Toast from "@/components/toast";
import { useToastsStore } from "@/state/toasts";

export default function RootLayout({
                                     children
                                   }: {
  children: ReactNode;
}) {
  // @ts-ignore
  const toastStore = useToastsStore(state => state);

  return (
    <html lang="en" suppressHydrationWarning>
    <head><title>ContractrPro</title></head>
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
          <main
            className="pt-16 px-6 flex-grow border-foreground-100 sm:border-2 rounded-tl-md bg-foreground-50">
            {children}
            <div id={"toasts"} className={"fixed bottom-0 right-0 flex flex-col gap-y-4 p-4"}>
              {toastStore.toasts.map(toast => <Toast key={toast.id} {...toast} onClose={() => {
                toastStore.removeToast(toast.id);
              }} showDuration={true} durationInSecs={5} />)}
            </div>
          </main>
        </div>
      </div>
    </Providers>
    </body>
    </html>
  );
}