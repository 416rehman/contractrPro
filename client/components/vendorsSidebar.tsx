"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import {IconBuilding, IconBuildingStore, IconChevronDown, IconCirclePlus, IconListSearch} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadVendors, useVendorsStore } from "@/services/vendors";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import SubSidebar from "@/components/subSidebar";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the vendors page. It displays a list of vendors and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Vendor service.
 * This is used in tandem with the VendorForm component to edit/create vendors.
 */
export default function VendorsSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [vendors] = useVendorsStore(state => [state.vendors]);
  const [vendorsToDisplay, setVendorsToDisplay] = useState(vendors);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    if (currentOrg?.id) {
      loadVendors(currentOrg?.id);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    // filter
    const vendorsToDisplay = vendors.filter((item: any) => item.name.toLowerCase().includes(filter.toLowerCase()));
    setVendorsToDisplay(vendorsToDisplay);
  }, [filter, vendors]);

  return <SubSidebar className={className} items={
    vendorsToDisplay?.map((item: any) => {
      return <li key={item.id}>
        <Button
            className={"w-full justify-start text-default-600 font-medium"}
            as={NextLink}
            href={"/vendors/" + item?.id}
            startContent={<IconBuildingStore className={"text-default-400"} size={"20"}/>}
            variant={params.id === item?.id ? "flat" : "light"}
            size={"sm"}>
          <span className={"truncate"}>{item?.name}</span>
        </Button>
      </li>
    })} title={"Vendor"} setFilter={setFilter} filter={filter} newItemUrl={"/vendors/new"}/>;
}