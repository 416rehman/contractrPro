import { ReactNode } from "react";
import ExpensesSidebar from "@/components/expenseSidebar";
import AuthRedirectServer from "@/components/server/authRedirectServer";

export default function PricingLayout({
                                        children
                                      }: {
  children: ReactNode;
}) {
  return (
    <AuthRedirectServer redirectIf={"logged-out"} to={"/login"}>
      <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
        <div className="flex text-center justify-center w-full flex-col h-full md:flex-row md:flex-grow">
          <ExpensesSidebar className={"flex-grow w-full md:max-w-[15rem] md:min-w-[15rem] print:hidden"} />
          {children}
        </div>
      </section>
    </AuthRedirectServer>
  );
}