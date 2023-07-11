"use client";

import NextLink from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { usePathname } from "next/navigation";
import React, { HTMLAttributes, useState } from "react";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";
import { useUserStore } from "@/state/user";

export const Sidebar = (props: HTMLAttributes<HTMLDivElement>) => {
  const user = useUserStore(state => state.user);
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

  return user && (
    <div className={" sm:flex sm:flex-col gap-8 p-2 items-center" + " " + props.className} {...props}>
      <ExtendSidebarButton />
      <div className={"flex flex-col justify-between gap-4"}>
        {siteConfig.sidebarItems.map((item) => (
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