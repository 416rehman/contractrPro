import EmployeeForm from "@/components/employeeForm";

export default function EmployeePage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow justify-center"}>
    <EmployeeForm id={params.id} className={"items-center max-w-full sm:max-w-xl"} />
  </div>;
}