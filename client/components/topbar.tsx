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
import Link from "next/link";
import NextLink from "next/link";
import { Input } from "@nextui-org/input";
import { ThemeSwitch } from "@/components/theme-switch";
import { useUserStore } from "@/state/user";
import { Button } from "@nextui-org/button";
import { IconLogin, IconSearch } from "@tabler/icons-react";
import { UserMenu } from "@/components/userMenu";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import AuthSwitch from "@/components/authSwitch";

export const Topbar = () => {
  const user = useUserStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // if the menu is open, close it when the pathname changes
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen, pathname]);

  const authButtons = (
    <NavbarContent>
      <NavbarItem>
        <Button
          as={Link}
          className="text-sm font-normal text-default-600 bg-default-100"
          size={"sm"}

          href={"login"}
          startContent={<IconLogin className={"pointer-events-none"} />}
          variant="flat"
        >
          <p className={"hidden sm:flex"}>Login</p>
        </Button>
      </NavbarItem>
      <NavbarItem>
        <Button as={Link} color="primary" href="signup" variant="flat" size={"sm"}>
          Sign Up
        </Button>
      </NavbarItem>
    </NavbarContent>
  );

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
    <Navbar position="sticky" className={"justify-between flex flex-row gap-2"} maxWidth={"full"}
            onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        {user?.id && <NavbarMenuToggle className={"flex sm:hidden"} />}
        <NavbarBrand className={"hidden sm:flex"}>
          <p className="font-bold text-inherit">ACME</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="center" className="gap-4 flex-grow">
        <AuthSwitch contentIfLoggedIn={<NavbarItem className={"flex-grow max-w-lg"}>
          {searchInput}
        </NavbarItem>} />
      </NavbarContent>
      <NavbarContent justify="end">
        <ThemeSwitch size={"md"} className={"hidden sm:flex"} />
        {user ?
          <NavbarItem>
            <UserMenu {...user} />
          </NavbarItem>
          :
          authButtons
        }
      </NavbarContent>
      {user?.id && <NavbarMenu>
        {siteConfig.sidebarItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Button
              className={"justify-start"}
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
      </NavbarMenu>}

    </Navbar>
  );
};