import { ReactNode } from "react";
import EmployeesSidebar from "@/components/employeesSidebar";

export default function DocsLayout({
                                     children
                                   }: {
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col justify-center gap-4 flex-grow items-start w-full">
      <div className="flex text-center justify-center w-full flex-col h-full sm:flex-row sm:flex-grow">
        <EmployeesSidebar className={"flex-grow w-full sm:max-w-[15rem]"} />
        {children}
      </div>
    </section>
  );
}