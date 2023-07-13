import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { useLocalsStore } from "@/state/locals";
import { tUser } from "@/types/types";
import { useEffect, useState } from "react";
import { IconBuildingSkyscraper, IconCirclePlus } from "@tabler/icons-react";
import JoinOrganizationModal from "@/components/joinOrganizationModal";
import { useDisclosure } from "@nextui-org/react";
import clsx from "clsx";
import CreateOrganizationModal from "@/components/createOrganizationModal";

type Props = {
  user: tUser & { [p: string]: any };
  className?: string;
}

export function OrganizationSelector({ user, className }: Props) {
  // disclosure for the join organization modal
  const { isOpen: isJoinOpen, onOpen: onJoinOpen, onOpenChange: onJoinOpenChange } = useDisclosure();
  // another disclosure for the create organization modal
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();

  const localsStore = useLocalsStore(state => state);

  const [selectedOrganization, setSelectedOrganization] = useState(null);

  useEffect(() => {
    if (localsStore.currentOrganization) {
      setSelectedOrganization(localsStore.currentOrganization);
    } else if (user?.Organizations?.[0]) {
      setSelectedOrganization(user?.Organizations?.[0]);
    } else {
      setSelectedOrganization(null);
    }
  }, [localsStore, user?.Organizations]);

  const onActionHandler = (id) => {
    if (id.startsWith("action_")) {
      switch (id) {
        case "action_create":
          onCreateOpen();
          break;
        case "action_join":
          onJoinOpen();
          break;
        default:
          console.log("Unknown action");
      }
    } else {
      localsStore.setCurrentOrganization(user?.Organizations?.find(org => org.id === id));
    }
  };

  // Bug on mobile where the dropdown opens and closes immediately when clicking on the trigger. This is a workaround.
  const [dropdownOpenTime, setDropdownOpenTime] = useState(0);

  return <>
    <JoinOrganizationModal isOpen={isJoinOpen} onOpenChange={onJoinOpenChange} onOpen={onJoinOpen} />
    <CreateOrganizationModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} onOpen={onCreateOpen} />

    <Dropdown placement="bottom-start" backdrop={"opaque"} isOpen={dropdownOpenTime > 0}
              onClose={() => Date.now() - dropdownOpenTime < 50 ? null : setDropdownOpenTime(0)}
              onOpenChange={(open) => open && setDropdownOpenTime(Date.now())}
              className={clsx("select-none", className)}
              aria-label="User Organizations">
      <DropdownTrigger>
        <User
          as="button"
          avatarProps={{
            isBordered: true,
            src: selectedOrganization?.logoUrl || "https://designshack.net/wp-content/uploads/placeholder-image.png"
          }}
          className="transition-transform justify-start hover:bg-default-100 flex flex-row items-center p-1 pr-2 rounded-full"
          description={selectedOrganization?.website || selectedOrganization?.phone || selectedOrganization?.description}
          isFocusable={true}
          name={selectedOrganization?.name}
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="User Organizations" variant="faded" onAction={onActionHandler}>
        <DropdownSection title={"Your Organizations"}>
          {user?.Organizations?.map((org) => (
            <DropdownItem key={org.id} textValue={org.name} className={clsx("flex flex-row items-center", {
              "bg-default-100 text-primary": localsStore.currentOrganization?.id === org.id
            })}>
              <User
                as="button"
                avatarProps={{
                  isBordered: true,
                  src: org.logoUrl || "https://designshack.net/wp-content/uploads/placeholder-image.png"
                }}
                className={"transition-transform flex flex-row items-center p-1"}
                description={org?.website || org?.phone || org?.description}
                name={org?.name}
              />
            </DropdownItem>
          )) || <DropdownItem textValue={"No organizations found"} />}
        </DropdownSection>
        <DropdownSection title={"Actions"}>
          <DropdownItem key="action_create" shortcut="⌘C" description="Create a new organization"
                        startContent={<IconBuildingSkyscraper />}>
            Create
          </DropdownItem>
          <DropdownItem key="action_join" shortcut="⌘J" description="Join an existing organization"
                        startContent={<IconCirclePlus />}>
            Join
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  </>;
}