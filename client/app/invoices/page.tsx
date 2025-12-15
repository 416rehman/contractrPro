import { Button } from "@heroui/button";
import { title } from "@/components/primitives";
import { IconCirclePlus } from "@tabler/icons-react";
import NextLink from "next/link";

export const metadata = {
  title: "Invoices | ContractrPro"
};
export default function ClientsPage() {
  return (
    <div className="flex flex-col flex-grow w-full items-center justify-center">
      <p className={title()}>Invoices</p>
      <br />
      <p>Select an invoice from the list on the left</p>
      <p>or create a new one.</p>
      <br />
      <Button color="secondary" size={"lg"} endContent={<IconCirclePlus className={"text-tr-light-200"} />}
              as={NextLink} href={"/invoices/new"}>
        Create new invoice
      </Button>
    </div>
  );
}
