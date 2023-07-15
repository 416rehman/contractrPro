import { ReactNode } from "react";
import ClientsSidebar from "@/components/clientsSidebar";

export default function PricingLayout({
                                        children
                                      }: {
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
      <div className="flex text-center justify-center w-full flex-col h-full sm:flex-row sm:flex-grow">
        <ClientsSidebar className={"flex-grow w-full sm:max-w-[15rem]"} />
        {children}
      </div>
    </section>
  );
}