"use client";
import {Card, CardBody, CardHeader} from "@nextui-org/card";
import {CardFooter, Input} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import {IconChevronDown, IconCirclePlus, IconListSearch, IconReceipt2} from "@tabler/icons-react";
import {useEffect, useState} from "react";
import {loadInvoices, useInvoicesStore} from "@/services/invoices";
import {useUserStore} from "@/services/user";
import {useParams} from "next/navigation";
import {Popover, PopoverContent, PopoverTrigger} from "@nextui-org/popover";
import SubSidebar from "@/components/subSidebar";

type Props = {
    className?: string;
}

/**
 * This is the sidebar for the invoices page. It displays a list of invoices and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Invoice service.
 * This is used in tandem with the InvoiceForm component to edit/create invoices.
 */
export default function InvoicesSidebar({className}: Props) {
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
        const filteredItems = invoices.filter((item: any) => item.invoiceNumber.toLowerCase().includes(filter.toLowerCase()));
        setInvoicesToDisplay(filteredItems || []);
    }, [filter, invoices]);

    return <SubSidebar className={className} items={
        invoicesToDisplay?.map((invoice: any) => {
            return <li key={invoice.id}>
                <Button
                    className={"w-full justify-start text-default-600 font-medium"}
                    as={NextLink}
                    href={"/invoices/" + invoice?.id}
                    startContent={<IconReceipt2 className={"text-default-400"} size={"20"}/>}
                    variant={params.id === invoice?.id ? "flat" : "light"}
                    size={"sm"}>
                    <span className={"truncate"}>{invoice?.invoiceNumber}</span>
                </Button>
            </li>
        })} title={"Invoice"} setFilter={setFilter} filter={filter} newItemUrl={"/invoices/new"}/>;
}