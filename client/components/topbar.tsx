"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import NextLink from "next/link";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { IconSearch } from "@tabler/icons-react";
import { UserMenu } from "@/components/userMenu";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import AuthFallback from "@/components/authFallback";
import { VisitorMenu } from "@/components/visitorMenu";
import { useUserStore } from "@/state/user";
import { OrganizationSelector } from "@/components/organizationSelector";
import { Divider } from "@nextui-org/divider";

export const Topbar = () => {
  const user = useUserStore(state => state.user);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // if the menu is open, close it when the pathname changes
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen, pathname]);

  const searchInput = (
    <Input
      aria-label="Search"
      className={"px-2"}
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm"
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <IconSearch className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <Navbar position="sticky" className={"justify-between flex flex-row gap-2 w-full"} maxWidth={"full"}
            onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        {user?.id && (
          <>
            <NavbarMenuToggle className={"flex sm:hidden"} />
            <NavbarBrand className={"hidden sm:flex"}>
              <OrganizationSelector user={user} className={"hidden sm:flex"} />
            </NavbarBrand>
          </>
        )}

      </NavbarContent>
      <NavbarContent justify="center" className="gap-4 flex-grow">
        <AuthFallback fallbackIf={"logged-in"} to={
          <NavbarItem className={"flex-grow max-w-lg"}>
            {searchInput}
          </NavbarItem>
        } />
      </NavbarContent>
      <NavbarContent justify="end">
        {user ?
          <NavbarItem>
            <UserMenu {...user} />
          </NavbarItem>
          :
          <VisitorMenu />
        }
      </NavbarContent>
      {user?.id && <NavbarMenu className={"flex flex-col gap-5 w-full p-0"}>
        <OrganizationSelector user={user} className={"w-full justify-start align-middle"} />
        <Divider />
        <div className={"w-full"}>
          {siteConfig.sidebarItems.map((item) => (
            <NavbarMenuItem key={item.href} className={"w-full"}>
              <Button
                className={"justify-start w-full"}
                key={item.href}
                as={NextLink}
                href={item.href}
                variant={pathname === item.href ? "flat" : "light"}
                color={pathname === item.href ? "primary" : "default"}
                size={"lg"}>
                {<item.icon stroke={1.5} />}
                {item.label}
              </Button>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>}

    </Navbar>
  );
};