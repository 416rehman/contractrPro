import { Metadata } from "next";
import ExpenseForm from "@/components/expenseForm";

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
    title: (id === "new" ? "New Expense" : "Expense " + id) + " | ContractrPro"
  };
}

export default function ExpensePage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow overflow-y-auto"}>
    <ExpenseForm id={params.id} className={"items-center max-w-full md:max-w-3xl"} />
  </div>;
}