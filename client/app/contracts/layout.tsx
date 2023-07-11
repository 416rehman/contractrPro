import { ReactNode } from "react";

export default function AboutLayout({
                                      children
                                    }: {
  children: ReactNode;
}) {
  return (
    <section className="flex flex-row gap-4 py-8 md:py-10">
      {children}
    </section>
  );
}