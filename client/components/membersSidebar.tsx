"use client";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { CardFooter, Input } from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import {
  IconAt,
  IconBuildingStore,
  IconChevronDown,
  IconCirclePlus,
  IconCrown,
  IconListSearch
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { loadMembers, useMembersStore } from "@/services/members";
import { useUserStore } from "@/services/user";
import { useParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/popover";
import { Tooltip } from "@nextui-org/tooltip";
import SubSidebar from "@/components/subSidebar";

type Props = {
  className?: string;
}

/**
 * This is the sidebar for the members page. It displays a list of members and should allow the user to filter them.
 * It handles communication with the API and updates the local state via the Member service.
 * This is used in tandem with the MemberForm component to edit/create members.
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


  return <SubSidebar className={className} items={
    membersToDisplay?.map((item: any) => {
      return <li key={item.id}>
        <Button
            className={"w-full justify-start text-default-600 font-medium"}
            as={NextLink}
            href={"/members/" + item?.id}
            startContent={<IconAt className={"text-default-400"} size={"20"} />}
            variant={params.id === item?.id ? "flat" : "light"}
            size={"sm"}>
          <div className={"flex flex-row gap-2 justify-between items-center w-full"}>
            <span className={"truncate"}>{item?.name}</span>
            {currentOrg?.OwnerId === item?.UserId &&
                <Tooltip content={"Owner"}>
                  <IconCrown className={"text-yellow-600"} size={"16"} />
                </Tooltip>
            }
          </div>

        </Button>
      </li>
    })} title={"Member"} setFilter={setFilter} filter={filter} newItemUrl={"/members/new"}/>;
}