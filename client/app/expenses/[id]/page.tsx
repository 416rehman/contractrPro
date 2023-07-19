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
    title: (id === "new" ? "New Expense" : "Expense " + id) + " | ContractrPro"
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <div>Expense: {params.id}</div>;
}