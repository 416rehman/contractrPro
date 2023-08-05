"use client";

import { subtitle, title } from "@/components/primitives";
import { Spacer } from "@nextui-org/spacer";
import OrganizationSelector from "@/components/organizationSelector";
import NextLink from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { deleteOrganizationAndPersist, useUserStore } from "@/services/user";
import OrganizationForm from "@/components/organizationForm";
import { Divider } from "@nextui-org/divider";
import { Button, ButtonGroup } from "@nextui-org/button";
import { IconChartTreemap, IconDotsVertical, IconListSearch, IconPencil, IconPencilOff, IconTrash } from "@tabler/icons-react";
import { Tooltip } from "@nextui-org/tooltip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Contract, Organization, tUser } from "@/types";
import { Card, CardBody, CardHeader, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { loadContracts, useContractsStore } from "@/services/contracts";

/**
 * The dashboard component. For now, it displays the current organization and allows the user to change and update it. In addition, it displays
 * a greeting based on the time of the day for the user and the first five contracts that have a recent due date, sorted by their due
 * date.
 */
export default function Dashboard() {
  const currentOrganization = useUserStore(state => state.currentOrganization);
  const currentUser = useUserStore(state => state.user);
  const [currentOrganizationContracts] = useContractsStore(state => [state.contracts]);

  const contracts = currentOrganizationContracts;

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

    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-wrap flex-grow gap-4 p-4">
        <DashboardUserGreeting currentUser={currentUser} />
      </div>

      <div className="flex flex-row flex-wrap flex-grow gap-4 p-2 md:p-10">

        <DashboardOrganizationForm currentOrganization={currentOrganization} />

        <Divider orientation={"vertical"} className={"hidden md:block"} />

        <div className="flex flex-col gap-4">
          <h1 className={title()}>At a glance!</h1>
          {/*  More quick stats and links here, such as user assigned tasks, total revenue/expenses, etc. */}
        </div>

        <div className="flex flex-col gap-4">
            <DashboardOrganizationContractsDue currentOrganization={currentOrganization} currentOrganizationContracts={contracts} />
        </div>

      </div>
    </div>
   
  );

}

type DashboardUserGreetingProps = {
  currentUser: tUser;
}

type DashboardOrganizationProps = {
  currentOrganization: Organization;
}

type DashboardOrganizationContractsDueProps = {
  currentOrganization: Organization,
  currentOrganizationContracts: Contract[],
}

export const DashboardUserGreeting = ({ currentUser }: DashboardUserGreetingProps) => {

  const currentHour: number = new Date().getHours();

  let greeting: String = "";

  if (currentHour < 12) {
    greeting = 'Good Morning';
  }
  else if (currentHour >= 12 && currentHour <= 17) {
    greeting = 'Good Afternoon';
  }
  else {
    greeting = 'Good Evening';
  }

  return (
    <h1 className={title()}>{greeting},&nbsp;{currentUser?.name}!</h1>
  );

}


export const DashboardOrganizationForm = ({ currentOrganization }: DashboardOrganizationProps) => {
  const [editingOrg, setEditingOrg] = React.useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [confirmDeleteInput, setConfirmDeleteInput] = React.useState<string>("");

  // after modal is closed, clear the input
  useEffect(() => {
    if (!isOpen) setConfirmDeleteInput("");
  }, [isOpen]);

  const deleteHandler = () => {
    if (confirmDeleteInput === currentOrganization.name) {
      deleteOrganizationAndPersist(currentOrganization.id);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete Organization</ModalHeader>
              <ModalBody>
                <p>Are you sure you want to delete this organization permanently?</p>
                <p className={"text-xs text-default-500"}>All data associated with this organization will be
                  deleted.</p>
                <Divider />
                <p className={"text-xs text-default-500"}>To confirm, type the name of the organization below:</p>
                <Input type={"text"} className={"w-full"} value={confirmDeleteInput} isRequired={true}
                       label={"Organization Name"}
                       onChange={(e) => setConfirmDeleteInput(e.target.value)} placeholder={currentOrganization.name} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" onClick={deleteHandler}
                        isDisabled={confirmDeleteInput !== currentOrganization.name}>Delete</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex flex-row justify-between items-center"}>
        <div className={"flex flex-col gap-2"}>
          <h1 className={title()}>Your&nbsp;<span
            className={title({ color: "violet" })}>Organization&nbsp;</span></h1>
          {currentOrganization?.id && (
            <span className={"text-xs text-default-500"}>{currentOrganization?.id}</span>
          )}
        </div>
        <ButtonGroup>
          <Tooltip content={editingOrg ? "Cancel" : "Edit"} showArrow={true}>
            <Button variant={"flat"} color={"default"} isIconOnly={true} onPress={() => setEditingOrg(!editingOrg)}>
              {editingOrg ? <IconPencilOff className={"text-default-500 hover:text-default-700"} /> :
                <IconPencil className={"text-default-500 hover:text-primary"} />}
            </Button>
          </Tooltip>
          <Dropdown>
            <DropdownTrigger>
              <Button variant={"flat"} color={"default"} isIconOnly={true}>
                <IconDotsVertical className={"text-default-500 hover:text-default-700"} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu onAction={(key) => key === "delete" && onOpen()}>
              <DropdownItem startContent={<IconTrash />} color={"danger"} description={"Delete this organization."}
                            key={"delete"}>
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </ButtonGroup>
      </div>
      <OrganizationForm organization={currentOrganization} editing={editingOrg} onSave={() => setEditingOrg(false)} />
    </div>
  );
};

export const DashboardOrganizationContractsDue = ({ currentOrganization, currentOrganizationContracts }: DashboardOrganizationContractsDueProps) => {

  const [isHovered, setIsHovered] = useState(false);

  const sortedContractsWithDueDate = currentOrganizationContracts.filter((contract) => contract.dueDate)
  .sort((a, b) => {
    if (a.dueDate && !b.dueDate) {
      return -1;
    }
    else if (!a.dueDate && b.dueDate) {
      return 1;
    }
    else if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    else {
      return 0;
    }
  }).slice(0,10);

  useEffect(() => {
    loadContracts(currentOrganization?.id);
  }, [currentOrganization?.id]);

  return (
    <Card className={"h-full"}>
      <CardHeader className={title()}>
        <h1 className={"text-center text-2xl font-bold"}>Contracts&nbsp;Due</h1>
      </CardHeader>
      <CardBody>
        <Divider />
        <br />
        {sortedContractsWithDueDate.length > 0 ?
          <ul>
            {sortedContractsWithDueDate.map((contract) => (
              <li key={contract.id}>
                <Button onMouseOver={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} variant={isHovered ? "flat" : "solid"} className={"text-center text-xs mb-5 w-full"} 
                        startContent={<IconChartTreemap className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />} as={NextLink} href={"/contracts/" + contract?.id}>
                  <div>
                    {contract?.name && contract.name.charAt(0).toUpperCase() + contract.name.slice(1)}
                    <br />
                    {contract?.dueDate ? <span>Due Date: {new Date(contract?.dueDate)
                    .toLocaleString("en-CA", { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", timeZone: "UTC" })
                    .toLocaleUpperCase()}</span> : ""}
                  </div>
                </Button>
              </li>             
            ))}
          </ul>
          : 
          <div className={subtitle()}>
            <p className={"text-center text-1xl font-bold"}>No Contracts Due</p>
          </div>
        }
      </CardBody>
    </Card>            
  );
}
