import InvoiceForm from "@/components/invoiceForm";

export default function ClientPage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow justify-center"}>
    <InvoiceForm id={params.id} className={"items-center max-w-full sm:max-w-xl"} />
  </div>;
}