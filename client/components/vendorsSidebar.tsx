"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconBuilding, IconChevronDown, IconCirclePlus, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadVendors, useVendorsStore } from "@/services/vendors";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

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

  const sidebar = (
    <Card shadow={"none"} isBlurred={true}
          className={clsx("border-none rounded-none", className)}>
      <CardHeader className={"flex flex-col gap-2"}>
        <h1 className={"text-2xl font-bold"}>Vendors</h1>
        {/*  Search bar*/}
        <Input aria-label={"Filter vendors"} placeholder={"Filter"} size={"sm"}
               startContent={<IconListSearch className={"text-default-400"} />}
               variant={"underlined"}
               isClearable={true}
               onClear={() => setFilter("")}
               onChange={(e) => setFilter(e.target.value)} />
      </CardHeader>
      <CardBody className={"p-2"}>
        <ul className={"flex flex-col w-full"}>
          {vendorsToDisplay && vendorsToDisplay.map((vendor) => (
            <li key={vendor.id}>
              <Button
                className={"w-full justify-start text-default-600 font-medium"}
                as={NextLink}
                href={"/vendors/" + vendor?.id}
                startContent={<IconBuilding className={"text-default-400"} size={"20"} />}
                variant={params.id === vendor?.id ? "flat" : "light"}
                size={"sm"}>
                <span className={"truncate"}>{vendor?.name}</span>
              </Button>
            </li>
          ))}
        </ul>
      </CardBody>
      <CardFooter>
        <Button variant={"light"} className={"flex-grow"} href={"/vendors/new"} as={NextLink}
                startContent={<IconCirclePlus className={"text-default-500"} />}>
          New Vendor
        </Button>
      </CardFooter>
    </Card>
  );

  // for mobile version have a dropdown
  const dropdown = <Popover className={className}>
    <PopoverTrigger className={"w-full flex md:hidden"}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
        Vendors
      </Button>
    </PopoverTrigger>
    <PopoverContent className={"rounded-md !w-[94vw] !h-[85vh] p-1"}>
      {sidebar}
    </PopoverContent>
  </Popover>;

  return <>
    <div className={"hidden md:flex md:flex-col md:gap-2 md:w-1/4"}>
      {sidebar}
    </div>
    <div className={"flex md:hidden"}>
      {dropdown}
    </div>
  </>;
}