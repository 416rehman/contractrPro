import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@nextui-org/dropdown";
import { User } from "@nextui-org/user";
import { useEffect, useState } from "react";
import { IconBuildingSkyscraper, IconCirclePlus } from "@tabler/icons-react";
import JoinOrganizationModal from "@/components/joinOrganizationModal";
import { useDisclosure } from "@nextui-org/react";
import clsx from "clsx";
import CreateOrganizationModal from "@/components/createOrganizationModal";
import { loadUserOrganizations, useUserStore } from "@/services/user";
import { getLocalStorageItem } from "@/utils/safeLocalStorage";

type Props = {
  className?: string;
}

const OrgItem = ({ selectedOrganization }) => {
  return <User
    as="button"
    avatarProps={{
      isBordered: true,
      src: selectedOrganization?.logoUrl || "https://icons-for-free.com/iconfiles/png/512/create+new+plus+icon-1320183284524393487.png"
    }}
    className="transition-transform justify-start hover:bg-default-100 flex flex-row items-center p-1 pr-2 rounded-full max-w-10"
    description={selectedOrganization?.website || selectedOrganization?.phone || selectedOrganization?.description || "Organizations"}
    isFocusable={true}
    name={selectedOrganization?.name || "Join or create an organization"}
  />;
};

export function OrganizationSelector({ className }: Props) {
  // disclosure for the join organization modal
  const { isOpen: isJoinOpen, onOpen: onJoinOpen, onOpenChange: onJoinOpenChange } = useDisclosure();
  // another disclosure for the create organization modal
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();

  const [userOrgs, currentOrg, setCurrentOrg] = useUserStore(state => [state.organizations, state.currentOrganization, state.setCurrentOrganization]);

  const [selectedOrganization, setSelectedOrganization] = useState(null);

  useEffect(() => {
    loadUserOrganizations();  // On the first render, load the loggedInUser's organizations into the store
  }, []);

  useEffect(() => {
    if (currentOrg?.id) {
      setSelectedOrganization(currentOrg);
    } else {
      setSelectedOrganization(JSON.parse(getLocalStorageItem("currentOrganization") || "null"));
    }
  }, [userOrgs, currentOrg]);

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
      // setCurrentOrg(userOrgs?.find(org => org.id === id));
      setCurrentOrg(userOrgs?.find(org => org.id === id));
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
              showArrow={true}
              aria-label="User Organizations">
      <DropdownTrigger>
        <div>
          <OrgItem selectedOrganization={selectedOrganization} />
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="User Organizations" variant="faded" onAction={onActionHandler}>
        <DropdownSection title={"Your Organizations"}>
          {userOrgs?.map((org) => (
            <DropdownItem key={org.id} textValue={org.name} className={clsx("flex flex-row items-center", {
              "bg-default-100 text-primary": currentOrg?.id === org.id
            })}>
              <OrgItem selectedOrganization={org} />
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