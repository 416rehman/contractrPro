"use client";
import { Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from "@heroui/dropdown";
import { Organization } from "@/types";
import { User } from "@heroui/user";
import { useEffect, useState } from "react";
import { IconBuildingSkyscraper, IconCirclePlus } from "@tabler/icons-react";
import JoinOrganizationModal from "@/components/joinOrganizationModal";
import { useDisclosure } from "@heroui/react";
import clsx from "clsx";
import OrganizationModal from "@/components/organizationModal";
import { loadUserWithOrganizations, setCurrentOrganization, useUserStore } from "@/services/user";

type Props = {
  className?: string;
  hideActions?: boolean;
  defaultTitle?: string;
  defaultSubtitle?: string;
}

const OrgItem = ({ logoUrl, description, name }: { logoUrl?: string; description?: string; name?: string }) => {
  return <User
    as="button"
    avatarProps={{
      isBordered: true,
      src: logoUrl || "/defaultImages/organizationDefault.png"
    }}
    className="transition-transform justify-start hover:bg-default-100 flex flex-row items-center p-1 pr-2 rounded-full max-w-10 font-medium"
    description={description}
    isFocusable={true}
    name={name}
  />;
};

/**
 * The organization selector is the main component for selecting an organization. It is used in the header and in any pages that require an organization to be selected.
 * ContractrPro is a multi-tenant application, so the organization is a key part of the application and most of the operations are scoped to an organization.
 * This component is a dropdown that lists the organizations the user is a member of. It also has actions for creating and joining organizations.
 * Upon selecting an organization, the `currentOrganization` state is updated in the user store. The `create organization` and `join organization` actions open their respective modals.
 * For more, see the **`JoinOrganizationModal`** and **`CreateOrganizationModal`** components.
 */
export default function OrganizationSelector({
  className,
  hideActions,
  defaultTitle = "Select an Organization",
  defaultSubtitle
}: Props) {
  // disclosure for the join organization modal
  const { isOpen: isJoinOpen, onOpen: onJoinOpen, onOpenChange: onJoinOpenChange } = useDisclosure();
  // another disclosure for the create organization modal
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();

  const userData = useUserStore(state => state.user);
  const currentOrg = useUserStore(state => state.currentOrganization);

  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    if (!userData?.Organizations || userData?.Organizations.length === 0) {
      loadUserWithOrganizations();
    }

    if (currentOrg?.id) {
      setSelectedOrganization(currentOrg);
    }
  }, [userData?.Organizations, currentOrg]);

  const onActionHandler = (id: any) => {
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
      if (!id) return;
      if (currentOrg?.id === id) {
        return;
      }
      setCurrentOrganization(userData?.Organizations?.find((org: Organization) => org.id === id));
    }
  };

  // Bug on mobile where the dropdown opens and closes immediately when clicking on the trigger. This is a workaround.
  const [dropdownOpenTime, setDropdownOpenTime] = useState(0);

  return <>
    <JoinOrganizationModal isOpen={isJoinOpen} onOpenChange={onJoinOpenChange} onOpen={onJoinOpen} />
    <OrganizationModal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} />

    <Dropdown placement="bottom-start" backdrop={"opaque"} isOpen={dropdownOpenTime > 0}
      onClose={() => Date.now() - dropdownOpenTime < 50 ? null : setDropdownOpenTime(0)}
      onOpenChange={(open) => open && setDropdownOpenTime(Date.now())}
      className={clsx("select-none", className)}
      showArrow={true}
      aria-label="User Organizations">
      <DropdownTrigger>
        <div className={"w-fit"}>
          <OrgItem name={selectedOrganization?.name || defaultTitle}
            description={selectedOrganization?.website || selectedOrganization?.phone || defaultSubtitle}
            logoUrl={selectedOrganization?.logoUrl} />
        </div>
      </DropdownTrigger>
      <DropdownMenu aria-label="User Organizations" variant="faded" onAction={onActionHandler}>
        <DropdownSection title={"Your Organizations"}>
          {userData?.Organizations?.map((org: Organization) => (
            <DropdownItem key={org.id} textValue={org.name} className={clsx("flex flex-row items-center", {
              "bg-default-100 text-primary": currentOrg?.id === org.id
            })}>
              <OrgItem name={org.name} description={org.description} logoUrl={org.logoUrl} />
            </DropdownItem>
          )) || <DropdownItem key="no-orgs" textValue={"No organizations found"} />}
        </DropdownSection>
        {hideActions ? null :
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
        }
      </DropdownMenu>
    </Dropdown>
  </>;
}