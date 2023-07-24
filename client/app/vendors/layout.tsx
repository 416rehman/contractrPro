import { ReactNode } from "react";
import ClientsSidebar from "@/components/vendorsSidebar";
import VendorsSidebar from "@/components/vendorsSidebar";

export default function PricingLayout({
                                        children
                                      }: {
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
      <div className="flex text-center justify-center w-full flex-col h-full md:flex-row md:flex-grow">
        <VendorsSidebar className={"flex-grow w-full md:max-w-[15rem]"} />
        {children}
      </div>
    </section>
  );
}