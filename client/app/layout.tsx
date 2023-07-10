"use client";
import "@/globals.css";
import { fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import { Topbar } from "@/components/topbar";
import clsx from "clsx";
import { Sidebar } from "@/components/sidebar";

export default function RootLayout({
                                     children
                                   }: {
  children: React.ReactNode;
}) {
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
        <div className="grid grid-cols-[0.01fr_1fr] grid-rows-[1fr] gap-x-0 gap-y-0 h-full">
          <Sidebar />
          <main
            className="pt-16 px-6 flex-grow border-foreground-100 border-2 rounded-tl-3xl">
            {children}
          </main>
        </div>
      </div>
    </Providers>
    </body>
    </html>
  );
}