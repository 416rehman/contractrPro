import { ReactNode } from "react";
import ExpenseSidebar from "@/components/expenseSidebar";

export default function PricingLayout({
                                        children
                                      }: {
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
      <div className="flex text-center justify-center w-full flex-col h-full md:flex-row md:flex-grow">
        <ExpenseSidebar className={"flex-grow w-full md:max-w-[15rem] print:hidden"} />
        {children}
      </div>
    </section>
  );
}