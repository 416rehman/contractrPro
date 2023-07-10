import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";
import { subtitle, title } from "@/components/primitives";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";

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
    <section className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="inline-block max-w-lg text-center justify-center">
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
  );
}