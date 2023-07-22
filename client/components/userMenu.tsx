"use client";

import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/dropdown";
import { Card } from "@nextui-org/card";
import clsx from "clsx";
import { Avatar } from "@nextui-org/avatar";
import { logout } from "@/services/auth";
import { useTheme } from "next-themes";
import { tUser } from "@/types";
import { CollectionChildren } from "@react-types/shared";
import { IconLogout, IconMoonFilled, IconSettings, IconSunFilled } from "@tabler/icons-react";

export const UserMenuGeneric = (props: tUser & { children: CollectionChildren<object>; onAction?: any }) => {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Card className={clsx("p-2 pl-3")} isPressable>
          <div className={clsx("flex flex-row gap-10 items-center")}>
            <div className="hidden md:flex flex-col gap-1">
              <div className="flex flex-col items-start">
                <p className="font-bold text-sm">{props.name}</p>
                <p className="text-default-500 text-xs">{props.email}</p>
              </div>
            </div>
            <Avatar isBordered radius="sm" src={props.avatarUrl || "/defaultImages/userDefault.png"} />
          </div>
        </Card>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu" onAction={props.onAction}>
        {props.children}
      </DropdownMenu>
    </Dropdown>
  );
};

/**
 * This is the user menu component. It is used to show the user menu in the top right corner of the screen.
 * - shows the user's unique username and email.
 * - also shows the user's profile picture.
 * - has a dropdown menu with options to logout, go to settings, etc.
 * - In mobile view, it only shows the user's avatar.
 * - In mobile view, it shows the user's username and email in the dropdown menu.
 */
export default function UserMenu(props: tUser) {
  const { theme, setTheme } = useTheme();

  const onAction = async (action: string) => {
    switch (action) {
      case "settings":
        console.log("settings");
        break;
      case "logout":
        console.log("logout");
        await logout();
        break;
      case "theme":
        theme === "dark" ? setTheme("light") : setTheme("dark");
        break;
    }
  };
  return (
    <UserMenuGeneric {...props} onAction={onAction}>
      <DropdownSection showDivider>
        <DropdownItem key="profile" className="h-14 gap-2 flex pointer-events-none md:hidden" isReadOnly>
          <p>Signed in as</p>
          <p className="font-semibold">@{props.username}</p>
        </DropdownItem>
        <DropdownItem
          key="theme"
          shortcut="T"
          startContent={theme === "dark" ? <IconMoonFilled /> : <IconSunFilled />}
          description={"Switch to " + (theme === "dark" ? "light" : "dark") + " mode"}
        >
          {theme === "dark" ? "Light" : "Dark"} mode
        </DropdownItem>
      </DropdownSection>
      <DropdownSection>
        <DropdownItem
          key="settings"
          shortcut="S"
          description={"Change your account settings"}
          startContent={<IconSettings />}
        >
          Settings
        </DropdownItem>
        <DropdownItem
          key="logout"
          shortcut="L"
          description={"Log out of your account"}
          startContent={<IconLogout />}
        >
          Log out
        </DropdownItem>
      </DropdownSection>
    </UserMenuGeneric>
  );
};
