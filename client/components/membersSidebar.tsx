"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { IconAt, IconChevronDown, IconCirclePlus, IconListSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadMembers, useMembersStore } from "@/services/members";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";

type Props = {
  className?: string;
}

/**
 * The MembersSidebar component renders a sidebar of the list of members for the user to click on one if they want to view its data in its page.
 * Underneath the list is a button that will allow them to create a new member, taking them to the create page that will allow them to do that.
 */
export default function MembersSidebar({ className }: Props) {
  const [currentOrg] = useUserStore(state => [state.currentOrganization]);
  const [members] = useMembersStore(state => [state.members]);
  const [membersToDisplay, setMembersToDisplay] = useState(members);
  const [filter, setFilter] = useState("");
  const params = useParams();

  useEffect(() => {
    if (currentOrg?.id) {
      loadMembers(currentOrg?.id);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    // filter
    const membersToDisplay = members.filter((item: any) => item.name.toLowerCase().includes(filter.toLowerCase()));
    setMembersToDisplay(membersToDisplay);
  }, [filter, members]);

  const sidebar = <Card shadow={"none"} isBlurred={true}
                        className={clsx("border-none rounded-none", className)}>
    <CardHeader className={"flex flex-col gap-2"}>
      <h1 className={"text-2xl font-bold"}>Members</h1>
      {/*  Search bar*/}
      <Input aria-label={"Filter Members"} placeholder={"Filter"} size={"sm"}
             startContent={<IconListSearch className={"text-default-400"} />}
             variant={"underlined"}
             isClearable={true}
             onClear={() => setFilter("")}
             onChange={(e) => setFilter(e.target.value)} />
    </CardHeader>
    <CardBody className={"p-2"}>
      <ul className={"flex flex-col w-full"}>
        {membersToDisplay && membersToDisplay.map((member) => (
          <li key={member.id}>
            <Button
              className={"w-full justify-start text-default-600 font-medium"}
              as={NextLink}
              href={"/members/" + member?.id}
              startContent={<IconAt className={"text-default-300"} size={"20"} />}
              variant={params.id === member?.id ? "flat" : "light"}
              size={"sm"}>
              <span className={"truncate"}>{member?.name}</span>
            </Button>
          </li>
        ))}
      </ul>
    </CardBody>
    <CardFooter>
      <Button variant={"light"} className={"flex-grow"} href={"/members/new"} as={NextLink}
              startContent={<IconCirclePlus className={"text-default-500"} />}>
        New Member
      </Button>
    </CardFooter>
  </Card>;

  // for mobile version have a dropdown
  const dropdown = <Popover className={className}>
    <PopoverTrigger className={"w-full flex md:hidden"}>
      <Button variant={"ghost"} className={""} endContent={<IconChevronDown />}>
        Members
      </Button>
    </PopoverTrigger>
    <PopoverContent className={"rounded-md !w-[94vw] !h-[85vh] p-1"}>
      {sidebar}
    </PopoverContent>
  </Popover>;

  return <>
    <div className={"hidden md:flex md:flex-col md:gap-2 md:min-w-1/4"}>
      {sidebar}
    </div>
    <div className={"flex md:hidden"}>
      {dropdown}
    </div>
  </>;
}