"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconChartTreemap, IconChevronDown, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadContracts, useContractsStore } from "@/services/contracts";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the contracts page. It displays a list of contracts and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Contract service.
 * This is used in tandem with the ContractForm component to edit/create contracts.
 * TODO: Implement filtering
 */
export default function ContractsSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [contracts] = useContractsStore(state => [state.contracts]);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    loadContracts(currentOrg?.id);
  }, [currentOrg?.id]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    contracts.filter((item: any) => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
  };

  const sidebar = <Card shadow={"none"} isBlurred={true}
                        className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Contracts</h1>
      {/*  Search bar*/}
      <Input aria-label={"Filter contracts"}
             placeholder={"Filter"} size={"sm"} endContent={<IconListSearch className={"text-default-400"} />}
             variant={"underlined"}
             onChange={handleFilterChange} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {contracts && contracts.map((contract) => (
          <li key={contract.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/contracts/" + contract?.id}
              startContent={<IconChartTreemap className={"text-default-300"} size={"20"} />}
              variant={params.id === contract?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{contract?.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"ghost"} className={"flex-grow font-md"} href={"/contracts/new"} as={NextLink}>
        Create New Contract
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