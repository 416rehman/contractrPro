import MemberForm from "@/components/memberForm";
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
    title: (id === "new" ? "New Member" : "Member " + id) + " | ContractrPro"
  };
}

export default function MemberPage({ params }: { params: { id: string } }) {
  return <div className={"flex flex-grow overflow-y-auto justify-center"}>
    <MemberForm id={params.id} className={"items-center max-w-full md:max-w-xl"} />
  </div>;
}