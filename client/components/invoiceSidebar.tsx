"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconChevronDown, IconCirclePlus, IconListSearch, IconReceipt2 } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadInvoices, useInvoicesStore } from "@/services/invoices";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the invoices page. It displays a list of invoices and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Invoice service.
 * This is used in tandem with the InvoiceForm component to edit/create invoices.
 */
export default function InvoicesSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [invoices] = useInvoicesStore(state => [state.invoices]);
  const [invoicesToDisplay, setInvoicesToDisplay] = useState(invoices);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    if (currentOrg?.id) {
      loadInvoices(currentOrg?.id);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    // filter
    const invoicesToDisplay = invoices.filter((item: any) => item.invoiceNumber.toLowerCase().includes(filter.toLowerCase()));
    setInvoicesToDisplay(invoicesToDisplay);
  }, [filter, invoices]);

  const sidebar = <Card shadow={"none"} isBlurred={true}
                        className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Invoices</h1>
      {/*  Search bar*/}
      <Input aria-label={"Filter Members"} placeholder={"Filter"} size={"sm"}
             startContent={<IconListSearch className={"text-default-400"} />}
             variant={"underlined"}
             isClearable={true}
             onClear={() => setFilter("")}
             onChange={(e) => setFilter(e.target.value)} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {invoicesToDisplay && invoicesToDisplay.map((invoice) => (
          <li key={invoice.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/invoices/" + invoice?.id}
              startContent={<IconReceipt2 className={"text-default-300"} size={"20"} />}
              variant={params.id === invoice?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{invoice?.invoiceNumber}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"light"} className={"flex-grow"} href={"/invoices/new"} as={NextLink}
              startContent={<IconCirclePlus className={"text-default-500"} />}>
        New Invoice
      </Button>
    </CardFooter>
  </Card>;

  // for mobile version have a dropdown
  const dropdown = <Popover>
    <PopoverTrigger className={clsx("w-full flex md:hidden", className)}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
        Invoices
      </Button>
    </PopoverTrigger>
    <PopoverContent className={"rounded-md !w-[94vw] !h-[85vh] p-1"}>
      {sidebar}
    </PopoverContent>
  </Popover>;

  return <>
    <div className={"hidden md:flex md:flex-col md:gap-2 md:min-w-1/4"}>
      {sidebar}
    </div>
    <div className={"flex md:hidden"}>
      {dropdown}
    </div>
  </>;
}