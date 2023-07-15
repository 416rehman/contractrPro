import ClientForm from "@/components/clientForm";

export default function ClientPage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow justify-center"}>
    <ClientForm id={params.id} className={"items-center max-w-full sm:max-w-xl"} />
  </div>;
}