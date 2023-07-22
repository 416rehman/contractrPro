import EmployeeForm from "@/components/employeeForm";
import { Metadata } from "next";

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  // read route params
  const id = params.id;

  return {
    title: (id === "new" ? "New Employee" : "Employee " + id) + " | ContractrPro"
  };
}

export default function EmployeePage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow overflow-y-auto justify-center"}>
    <EmployeeForm id={params.id} className={"items-center max-w-full md:max-w-xl"} />
  </div>;
}
