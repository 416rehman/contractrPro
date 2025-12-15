import { Metadata } from "next";
import { siteConfig } from "@/site";
import HomeCTA from "@/components/homeCTA";
import AuthSwitchServer from "@/components/server/authSwitchServer";
import Dashboard from "@/components/dashboard";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" }
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png"
  }
};

export default function Home() {

  return (
    <section className="flex flex-col gap-4 flex-grow w-full"><AuthSwitchServer
      contentIfLoggedIn={
        <Dashboard />
      } contentIfLoggedOut={
        <HomeCTA />
      } />
    </section>
  );
}