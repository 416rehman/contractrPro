"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import {IconBuilding, IconChevronDown, IconCirclePlus, IconListSearch, IconReceipt2} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadClients, useClientsStore } from "@/services/clients";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import SubSidebar from "@/components/subSidebar";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the clients page. It displays a list of clients and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Client service.
 * This is used in tandem with the ClientForm component to edit/create clients.
 */
export default function ClientsSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [clients] = useClientsStore(state => [state.clients]);
  const [clientsToDisplay, setClientsToDisplay] = useState(clients);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    if (currentOrg?.id) {
      loadClients(currentOrg?.id);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    // filter
    const clientsToDisplay = clients.filter((item: any) => item.name.toLowerCase().includes(filter.toLowerCase()));
    setClientsToDisplay(clientsToDisplay);
  }, [filter, clients]);

  return <SubSidebar className={className} items={
    clientsToDisplay?.map((item: any) => {
      return <li key={item.id}>
        <Button
            className={"w-full justify-start text-default-600 font-medium"}
            as={NextLink}
            href={"/clients/" + item?.id}
            startContent={<IconBuilding className={"text-default-400"} size={"20"}/>}
            variant={params.id === item?.id ? "flat" : "light"}
            size={"sm"}>
          <span className={"truncate"}>{item?.name}</span>
        </Button>
      </li>
    })} title={"Client"} setFilter={setFilter} filter={filter} newItemUrl={"/clients/new"}/>;
}