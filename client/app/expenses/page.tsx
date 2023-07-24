import { Button } from "@nextui-org/button";
import { title } from "@/components/primitives";
import { IconCirclePlus } from "@tabler/icons-react";
import NextLink from "next/link";

export const metadata = {
  title: "Expenses | ContractrPro"
};
export default function ClientsPage() {
  return (
    <div className="flex flex-col flex-grow w-full items-center justify-center">
      <p className={title()}>Expenses</p>
      <br />
      <p>Select an expense from the list on the left</p>
      <p>or create a new one.</p>
      <br />
      <Button color="secondary" size={"lg"} endContent={<IconCirclePlus className={"text-tr-light-200"} />}
              as={NextLink} href={"/expenses/new"}>
        Create new expense
      </Button>
    </div>
  );
}
