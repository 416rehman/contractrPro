"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconBuilding, IconChevronDown, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadClients, useClientsStore } from "@/services/clients";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

type Props = {
  className?: string;
}

export default function ClientsSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [clients] = useClientsStore(state => [state.clients]);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    loadClients(currentOrg?.id);
  }, [currentOrg?.id]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    clients.filter((item: any) => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
  };

  const sidebar = <Card shadow={"none"} isBlurred={true}
                        className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Clients</h1>
      {/*  Search bar*/}
      <Input placeholder={"Filter"} size={"sm"} endContent={<IconListSearch className={"text-default-400"} />}
             variant={"underlined"}
             onChange={handleFilterChange} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {clients && clients.map((client) => (
          <li key={client.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/clients/" + client?.id}
              startContent={<IconBuilding className={"text-default-300"} size={"20"} />}
              variant={params.id === client?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{client?.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"ghost"} className={"flex-grow"} href={"/clients/new"} as={NextLink}>
        Create New Client
      </Button>
    </CardFooter>
  </Card>;

  // for mobile version have a dropdown
  const dropdown = <Popover className={className}>
    <PopoverTrigger className={"w-full flex sm:hidden"}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
        Clients
      </Button>
    </PopoverTrigger>
    <PopoverContent className={"rounded-md !w-[94vw] !h-[85vh] p-1"}>
      {sidebar}
    </PopoverContent>
  </Popover>;

  return <>
    <div className={"hidden sm:flex sm:flex-col sm:gap-2 sm:w-1/4"}>
      {sidebar}
    </div>
    <div className={"flex sm:hidden"}>
      {dropdown}
    </div>
  </>;
}