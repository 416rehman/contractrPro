"use client";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { CardFooter, Input } from "@heroui/react";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconChartTreemap, IconChevronDown, IconCirclePlus, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadContracts, useContractsStore } from "@/services/contracts";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the contracts page. It displays a list of contracts and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Contract service.
 * This is used in tandem with the ContractForm component to edit/create contracts.
 */
export default function ContractsSidebar({ className }: Props) {
  const currentOrg = useUserStore(state => state.currentOrganization);
  const [contracts] = useContractsStore(state => [state.contracts]);
  const [contractsToDisplay, setContractsToDisplay] = useState(contracts);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    if (currentOrg?.id) {
      loadContracts(currentOrg?.id);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    const contractsToDisplay = contracts.filter((item: any) => item.name.toLowerCase().includes(filter.toLowerCase()));
    setContractsToDisplay(contractsToDisplay);
  }, [filter, contracts]);

  const sidebar = <Card shadow={"none"} isBlurred={true}
    className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Contracts</h1>
      {/*  Search bar*/}
      <Input aria-label={"Filter Contracts"} placeholder={"Filter"} size={"sm"}
        startContent={<IconListSearch className={"text-default-400"} />}
        variant={"underlined"}
        isClearable={true}
        onClear={() => setFilter("")}
        onChange={(e) => setFilter(e.target.value)} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {contractsToDisplay && contractsToDisplay.map((contract: any) => (
          <li key={contract.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/contracts/" + contract?.id}
              startContent={<IconChartTreemap className={"text-default-400"} size={"20"} />}
              variant={params.id === contract?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{contract?.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"light"} className={"flex-grow"} href={"/contracts/new"} as={NextLink}
        startContent={<IconCirclePlus className={"text-default-500"} />}>
        New Contract
      </Button>
    </CardFooter>
  </Card>;

  // for mobile version have a dropdown
  const dropdown = <Popover>
    <PopoverTrigger className={clsx("w-full flex md:hidden", className)}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
        Contracts
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