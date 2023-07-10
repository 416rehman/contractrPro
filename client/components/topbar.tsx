"use client";

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import Link from "next/link";
import { Input } from "@nextui-org/input";
import { ThemeSwitch } from "@/components/theme-switch";
import { useUserStore } from "@/state/user";
import { Button } from "@nextui-org/button";
import { IconLogin, IconSearch } from "@tabler/icons-react";
import { UserMenu } from "@/components/userMenu";

export const Topbar = () => {
  const user = useUserStore((state) => state.user);

  const authButtons = (
    <NavbarContent>
      <NavbarItem>
        <Button
          as={Link}
          className="text-sm font-normal text-default-600 bg-default-100"
          href={"login"}
          startContent={<IconLogin className={"pointer-events-none"} />}
          variant="flat"
        >
          Login
        </Button>
      </NavbarItem>
      <NavbarItem>
        <Button as={Link} color="primary" href="signup" variant="flat">
          Sign Up
        </Button>
      </NavbarItem>
    </NavbarContent>
  );

  const searchInput = (
    <Input
      aria-label="Search"
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
    <Navbar position="static" className={"justify-between"} maxWidth={"full"}>
      <NavbarBrand>
        <p className="font-bold text-inherit">ACME</p>
      </NavbarBrand>
      <NavbarContent justify="center" className="gap-4 flex-grow">
        <NavbarItem className={"flex-grow max-w-lg"}>
          {searchInput}
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <ThemeSwitch size={"lg"} />
        {user ?
          <NavbarItem>
            <UserMenu {...user} />
          </NavbarItem>
          :
          authButtons
        }
      </NavbarContent>
    </Navbar>
  );
};