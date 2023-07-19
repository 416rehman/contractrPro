import ClientForm from "@/components/clientForm";
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
    title: (id === "new" ? "New Client" : "Client " + id) + " | ContractrPro"
  };
}

export default function ClientPage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow justify-center"}>
    <ClientForm id={params.id} className={"items-center max-w-full md:max-w-xl"} />
  </div>;
}