"use client";

import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import { useTheme } from "next-themes";
import { IconAsterisk, IconLogin, IconMenu2, IconMoonFilled, IconSunFilled } from "@tabler/icons-react";
import { NavbarContent, NavbarItem } from "@heroui/navbar";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import ThemeSwitch from "@/components/theme-switch";
import React from "react";

type display = "dropdown" | "navbar" | "both";

/**
 * The menu for visitors (not logged-in users). Contains the login and signup buttons.
 * - is a dropdown on small screens
 * - is a navbar on large screens
 * - contains a theme switch
 * - contains a link to the login page
 * - contains a link to the signup page
 */
export const VisitorMenu = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const visitorItems: { display: display, [key: string]: any }[] = [
    {
      content: "Sign Up",
      href: "/signup",
      onAction: () => router.push("signup"),
      icon: <IconAsterisk />,
      color: "primary",
      description: "Create a new account",
      shortcut: "S",
      display: "both"
    },
    {
      content: "Login",
      href: "/login",
      onAction: () => router.push("login"),
      icon: <IconLogin />,
      color: "default",
      description: "Login to your account",
      shortcut: "L",
      display: "both"
    },
    {
      content: <ThemeSwitch size={"md"} className={"hidden md:flex"} key="theme-switch" />,
      isolated: true, // The content will not be wrapped
      display: "navbar"
    },
    {
      content: "Switch Theme",
      href: "",
      onAction: () => theme === "dark" ? setTheme("light") : setTheme("dark"),
      icon: theme === "dark" ? <IconMoonFilled /> : <IconSunFilled />,
      color: "default",
      description: `Switch to ${theme === "dark" ? "light" : "dark"} theme`,
      shortcut: "T",
      display: "dropdown"
    }
  ];

  const onAction = async (key: any) => {
    const action = visitorItems[parseInt(key)]?.onAction;
    if (action) await action();
  };

  return (
    <>
      {/*// Show on screens bigger than sm*/}
      <NavbarContent className={"hidden md:flex"}>
        {visitorItems.map((item, index) => (
          <NavbarItem key={index}>
            {(item.display == "both" || item.display == "navbar") && (item.isolated ? item.content : (
              <Tooltip content={item.description} placement={"bottom"}>
                <Button key={index} as={NextLink} color={item.color} href={item.href} variant="flat" size={"sm"}>
                  {item.icon}
                  {item.content}
                </Button>
              </Tooltip>
            ))}
          </NavbarItem>
        ))}
      </NavbarContent>
      {/*// Show on screens smaller than sm*/}
      <NavbarContent className={"flex md:hidden"}>
        <NavbarItem className={"gap-2 flex flex-row"}>
          {
            <Button as={NextLink} color="primary" href={visitorItems[0].href} variant="flat" size={"md"}>
              {visitorItems[0].icon}
              {visitorItems[0].content}
            </Button>
          }
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly size={"md"} variant={"flat"}>
                <IconMenu2 />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              variant={"faded"}
              aria-label="Job options"
              selectionMode="single"
              onAction={onAction}
            >
              {visitorItems
                .map((item, index) => ({ item, index }))
                .filter(({ item, index }) => index > 0 && item.display !== "navbar")
                .map(({ item, index }) => (
                  <DropdownItem key={index} value={item.href} description={item.description} startContent={item.icon}
                    shortcut={item?.shortcut || ""}>
                    {item.content}
                  </DropdownItem>
                ))}
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </>
  );
};