"use client";

import NextLink from "next/link";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { usePathname } from "next/navigation";
import React, { HTMLAttributes, useState } from "react";
import {
  IconBuilding,
  IconBuildingStore,
  IconChartTreemap,
  IconDashboard,
  IconDevicesDollar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconReceipt2,
  IconUsers
} from "@tabler/icons-react";

export const sidebarItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: IconDashboard,
    shortDescription: "Your organization at a glance"
  },
  {
    label: "Contracts",
    href: "/contracts",
    icon: IconChartTreemap,
    shortDescription: "Manage your contracts"
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: IconDevicesDollar,
    shortDescription: "The money you spend"
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: IconReceipt2,
    shortDescription: "The money you make"
  },
  {
    label: "Employees",
    href: "/employees",
    icon: IconUsers,
    shortDescription: "Members of your organization"
  },
  {
    label: "Clients",
    href: "/clients",
    icon: IconBuilding,
    shortDescription: "The people/organizations you provide services to"
  },
  {
    label: "Vendors",
    href: "/vendors",
    icon: IconBuildingStore,
    shortDescription: "The people/organizations you buy from"
  }
];

/**
 * This is the main sidebar for the application. It displays a list of links to the main pages of the application.
 * - It requires the user to be logged in.
 * - The sidebar is collapsible
 * - It displays a tooltip on hover for each item
 * - It highlights the current page
 * - It becomes a top bar on mobile (merged with TopBar)
 */
export default function Sidebar(props: HTMLAttributes<HTMLDivElement>) {
  const [isExtended, setIsExtended] = useState(false);
  const pathname = usePathname();

  const ExtendSidebarButton = () => (
    <Tooltip content={isExtended ? "Collapse" : "Expand"} placement={"right"} showArrow={true}>
      <Button isIconOnly={!isExtended} onClick={() => setIsExtended(!isExtended)} variant={"light"} size={"sm"}
              className={"min-w-full"}>
        {isExtended ? <IconLayoutSidebarLeftCollapse size={"20"} /> : <IconLayoutSidebarLeftExpand size={"20"} />}
        {isExtended ? "Collapse" : null}
      </Button>
    </Tooltip>
  );

  return (
    <div className={" sm:flex sm:flex-col gap-8 p-2 items-center" + " " + props.className} {...props}>
      <ExtendSidebarButton />
      <div className={"flex flex-col justify-between gap-4"}>
        {sidebarItems.map((item) => (
          <Tooltip content={item.label} key={item.href} placement={"right"} showArrow={true}>
            <Button
              className={isExtended ? "justify-start" : "justify-center"}
              isIconOnly={!isExtended}
              key={item.href}
              as={NextLink}
              href={item.href}
              variant={pathname === item.href ? "flat" : "light"}
              color={pathname === item.href ? "primary" : "default"}
              size={"lg"}>
              {<item.icon stroke={1.5} />}
              {isExtended ? item.label : null}

            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};