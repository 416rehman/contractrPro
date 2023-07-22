import InvoiceForm from "@/components/invoiceForm";
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
    title: (id === "new" ? "New Invoice" : "Invoice " + id) + " | ContractrPro"
  };
}

export default function ClientPage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow overflow-y-auto"}>
    <InvoiceForm id={params.id} className={"items-center max-w-full md:max-w-3xl"} />
  </div>;
}
