"use client";

import { subtitle, title } from "@/components/primitives";
import { Spacer } from "@nextui-org/spacer";
import OrganizationSelector from "@/components/organizationSelector";
import React from "react";
import { useUserStore } from "@/services/user";
import OrganizationForm from "@/components/organizationForm";
import { Divider } from "@nextui-org/divider";
import { Button } from "@nextui-org/button";
import { IconPencil, IconPencilOff } from "@tabler/icons-react";

/**
 * The dashboard component. For now, it must display the current organization and allow the user to change and update it.
 */
export default function Dashboard() {
  const currentOrganization = useUserStore(state => state.currentOrganization);
  const [editingOrg, setEditingOrg] = React.useState<boolean>(false);

  if (!currentOrganization?.id) {
    return (
      <div className="flex flex-col flex-grow text-center justify-center items-center w-full">
        <h1 className={title()}>Do&nbsp;<span className={title({ color: "violet" })}>more&nbsp;</span></h1>
        <br />
        <h1 className={title()}>
          with ContractrPro.
        </h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Get started by selecting your organization.
        </h2>
        <Spacer y={4} />
        <OrganizationSelector />
      </div>
    );
  }

  return (
    <div className="flex flex-row flex-wrap flex-grow gap-4 p-2 md:p-10">
      <div className="flex flex-col gap-4">
        <div className={"flex flex-row justify-between items-center"}>
          <div className={"flex flex-col gap-2"}>
            <h1 className={title()}>Your&nbsp;<span
              className={title({ color: "violet" })}>Organization&nbsp;</span></h1>
            {currentOrganization?.id && (
              <span className={"text-xs text-default-500"}>{currentOrganization?.id}</span>
            )}
          </div>
          <Button variant={"flat"} color={"default"} isIconOnly={true} onPress={() => setEditingOrg(!editingOrg)}>
            {editingOrg ? <IconPencilOff className={"text-default-500 hover:text-default-700"} /> :
              <IconPencil className={"text-default-500 hover:text-primary"} />}
          </Button>
        </div>
        <OrganizationForm organization={currentOrganization} editing={editingOrg} onSave={() => setEditingOrg(false)} />
      </div>
      <Divider orientation={"vertical"} className={"hidden md:block"} />
      <div className="flex flex-col gap-4">
        <h1 className={title()}>At a glance!</h1>
        {/*  More quick stats and links here, such as user assigned tasks, contracts due soon, etc. */}
      </div>
    </div>
  );
}