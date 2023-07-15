import { Metadata } from "next";
import { siteConfig } from "@/site";
import HomeCTA from "@/components/homeCTA";
import React from "react";
import AuthSwitchServer from "@/components/server/authSwitchServer";
import { subtitle, title } from "@/components/primitives";
import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";

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

  return <AuthSwitchServer contentIfLoggedIn={
    <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
      <div className="flex flex-col flex-grow text-center justify-center w-full">
        <h1 className={title()}>Make&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>beautiful&nbsp;</h1>
        <br />
        <h1 className={title()}>
          websites regardless of your design experience.
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Beautiful, fast and modern React UI library.
        </h2>
      </div>

      <div className="mt-8">
        <Snippet hideSymbol hideCopyButton variant="bordered">
  			<span>
  				Get started by editing <Code color="primary">app/page.tsx</Code>
  			</span>
        </Snippet>
      </div>
    </section>
  } contentIfLoggedOut={
    <HomeCTA />
  } />;
}