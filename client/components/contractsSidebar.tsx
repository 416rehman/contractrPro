"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import {IconChartTreemap, IconChevronDown, IconCirclePlus, IconListSearch, IconReceipt2} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadContracts, useContractsStore } from "@/services/contracts";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import SubSidebar from "@/components/subSidebar";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the contracts page. It displays a list of contracts and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Contract service.
 * This is used in tandem with the ContractForm component to edit/create contracts.
 */
export default function ContractsSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
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
    // filter
    const filteredItems = contracts.filter((item: any) => item.name.toLowerCase().includes(filter.toLowerCase()));
    setContractsToDisplay(filteredItems || []);
  }, [filter, contracts]);

  return <SubSidebar className={className} items={
    contractsToDisplay?.map((contract: any) => {
      return <li key={contract.id}>
        <Button
            className={"w-full justify-start text-default-600 font-medium"}
            as={NextLink}
            href={"/contracts/" + contract?.id}
            startContent={<IconChartTreemap className={"text-default-400"} size={"20"}/>}
            variant={params.id === contract?.id ? "flat" : "light"}
            size={"sm"}>
          <span className={"truncate"}>{contract?.name}</span>
        </Button>
      </li>
    })} title={"Contract"} setFilter={setFilter} filter={filter} newItemUrl={"/contracts/new"}/>;
}