"use client";

import { IUser } from "@/state/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Card } from "@nextui-org/card";
import clsx from "clsx";
import { Avatar } from "@nextui-org/avatar";
import { IconLogout, IconSettings } from "@tabler/icons-react";
import { logout } from "@/services/auth";

export const UserMenu = (props: IUser) => {
  const onAction = async (action: string) => {
    switch (action) {
      case "settings":
        console.log("settings");
        break;
      case "logout":
        console.log("logout");
        await logout();
    }
  };
  return (
    <Dropdown>
      <DropdownTrigger>
        <Card className={clsx("p-2")} isPressable={true}>
          <div className={clsx("flex flex-row gap-10 items-center")}>
            <div className="flex flex-col gap-1">
              <div>
                <p className="font-bold text-sm">{props.name}</p>
                <p className="text-default-500 text-xs">{props.email}</p>
              </div>
            </div>
            <Avatar isBordered radius="sm" src="https://i.pravatar.cc/150?u=a04258114e29026708c" />
          </div>
        </Card>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with icons" onAction={onAction}>
        <DropdownItem
          key="settings"
          shortcut="⌘S"
          startContent={<IconSettings />}
        >
          Settings
        </DropdownItem>
        <DropdownItem
          key="logout"
          shortcut="⌘L"
          startContent={<IconLogout />}
        >
          Log out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};