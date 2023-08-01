"use client";

import { subtitle, title } from "@/components/primitives";
import { Spacer } from "@nextui-org/spacer";
import OrganizationSelector from "@/components/organizationSelector";
import React from "react";
import { useUserStore } from "@/services/user";
import OrganizationForm from "@/components/organizationForm";
import { Divider } from "@nextui-org/divider";

export default function Dashboard() {
  const currentOrganization = useUserStore(state => state.currentOrganization);

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
        <h1 className={title()}>Your&nbsp;<span
          className={title({ color: "violet" })}>Organization&nbsp;</span></h1>
        {currentOrganization?.id && (
          <span className={"text-xs text-default-500"}>{currentOrganization?.id}</span>
        )}
        <OrganizationForm organization={currentOrganization} />
      </div>
      <Divider orientation={"vertical"} className={"hidden md:block"} />
      <div className="flex flex-col gap-4">
        <h1 className={title()}>Your Projects</h1>
      </div>
    </div>
  );
}