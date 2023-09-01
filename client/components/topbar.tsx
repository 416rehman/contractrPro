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
import NextLink from "next/link";
import { Button } from "@nextui-org/button";
import UserMenu from "@/components/userMenu";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AuthFallback from "@/components/authFallback";
import { VisitorMenu } from "@/components/visitorMenu";
import { useUserStore } from "@/services/user/";
import OrganizationSelector from "@/components/organizationSelector";
import { Divider } from "@nextui-org/divider";
import { sidebarBottomItems, sidebarItems } from "@/components/sidebar";
import clsx from "clsx";
import SearchBox from "@/components/searchBox";
import { IconAlertTriangle } from "@tabler/icons-react";

/**
 * The main navigation component of the app. It is shown at the top of the screen.
 * - Always visible.
 * - If no user is logged in, it shows the visitor menu.
 * - If a user is logged in, it shows the user menu, a search bar, and the organization selector.
 * - In mobile, it shows a hamburger menu that shows its content in a vertical navbar.
 * - In mobile, it also shows the sidebar items in a vertical navbar.
 */
export default function Topbar({ className }: { className?: string }) {
  const user = useUserStore(state => state.user);
  const currentOrganization = useUserStore(state => state.currentOrganization);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // if the menu is open, close it when the pathname changes
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen, pathname]);
  return (
    <Navbar position="sticky" className={clsx("justify-between flex flex-row gap-2 w-full", className)}
            maxWidth={"full"}
            onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        {user?.id && (
          <>
            <NavbarMenuToggle className={"flex md:hidden"} />
            <NavbarBrand className={"hidden md:flex"}>
              <OrganizationSelector className={"hidden md:flex"} />
            </NavbarBrand>
          </>
        )}

      </NavbarContent>
      <NavbarContent justify="center" className="gap-4 flex-grow">
        <AuthFallback fallbackIf={"logged-in"} to={
          <NavbarItem className={"flex-grow max-w-lg"}>
            {currentOrganization?.id ? <SearchBox /> :
              <div className={"text-danger flex flex-row justify-center items-center gap-2 font-medium text-sm"}>
                <IconAlertTriangle size={20} />Select or create an organization</div>}
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
        <OrganizationSelector className={"w-full justify-start align-middle"} />
        <Divider />
        <div className={"w-full h-full p-2 flex flex-col justify-between"}>
          <div>
            {sidebarItems.map((item) => (
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
          <div>
            {sidebarBottomItems.map((item) => (
              <NavbarMenuItem key={item.href} className={"w-full"}>
                <Button
                  className={"justify-start w-full"}
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  variant={pathname === item.href ? "flat" : "ghost"}
                  color={pathname === item.href ? "primary" : "default"}
                  size={"lg"}>
                  {<item.icon stroke={1.5} />}
                  {item.label}
                </Button>
              </NavbarMenuItem>
            ))}
          </div>
        </div>
      </NavbarMenu>}

    </Navbar>
  );
};