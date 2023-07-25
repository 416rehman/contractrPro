import ContractForm from "@/components/contractForm";
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
    title: (id === "new" ? "New Contract" : "Contract " + id) + " | ContractrPro"
  };
}

export default function ClientPage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow overflow-y-auto"}>
    <ContractForm id={params.id} className={"items-center max-w-full"} />
  </div>;
}