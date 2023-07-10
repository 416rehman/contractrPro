"use client";

import NextLink from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@nextui-org/button";
import { Tooltip } from "@nextui-org/tooltip";
import { usePathname } from "next/navigation";

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className={"flex flex-col justify-between gap-8 p-2 items-center"}>
      <div className={"flex flex-col justify-between gap-4"}>
        {siteConfig.sidebarItems.map((item) => (
          <Tooltip content={item.label + pathname} key={item.href} placement={"right"} showArrow={true}>
            <Button
              isIconOnly
              key={item.href}
              as={NextLink}
              href={item.href}
              variant={pathname === item.href ? "flat" : "light"}
              color={pathname === item.href ? "primary" : "default"}
              size={"lg"}>
              {<item.icon stroke={1.5} />}
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};