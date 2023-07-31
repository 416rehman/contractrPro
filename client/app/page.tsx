import { Metadata } from "next";
import { siteConfig } from "@/site";
import HomeCTA from "@/components/homeCTA";
import React from "react";
import AuthSwitchServer from "@/components/server/authSwitchServer";
import { subtitle, title } from "@/components/primitives";
import OrganizationSelector from "@/components/organizationSelector";
import { Spacer } from "@nextui-org/spacer";

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
      <div className="flex flex-col flex-grow text-center justify-center items-center w-full">
        <h1 className={title()}>Do&nbsp;<span className={title({ color: "violet" })}>more&nbsp;</span></h1>

        <br />
        <h1 className={title()}>
          with ContractrPro.
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Get started by selecting your organization.
        </h2>
        <Spacer y={4} />
        <OrganizationSelector />
      </div>
    </section>
  } contentIfLoggedOut={
    <HomeCTA />
  } />;
}