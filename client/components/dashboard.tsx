"use client";

import { subtitle, title } from "@/components/primitives";
import { Spacer } from "@nextui-org/spacer";
import OrganizationSelector from "@/components/organizationSelector";
import NextLink from "next/link";
import React, { useEffect, useState } from "react";
import { deleteOrganizationAndPersist, useUserStore } from "@/services/user";
import OrganizationForm from "@/components/organizationForm";
import { Divider } from "@nextui-org/divider";
import { Button, ButtonGroup } from "@nextui-org/button";
import {
  IconBuildingStore,
  IconChartTreemap,
  IconDevicesDollar,
  IconDotsVertical,
  IconPencil,
  IconPencilOff,
  IconReceipt2,
  IconTrash,
  IconUsers
} from "@tabler/icons-react";
import { Tooltip } from "@nextui-org/tooltip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Contract, Organization } from "@/types";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@nextui-org/react";
import ExpensesTotalCard from "@/components/expensesTotalCard";
import InvoicesTotalCard from "@/components/invoicesTotalCard";
import SummaryCard from "@/components/summaryCard";
import { loadContracts, useContractsStore } from "@/services/contracts";

/**
 * The dashboard component. For now, it displays the current organization and allows the user to change and update it. In addition, it displays
 * a greeting based on the time of the day for the user and the first five contracts that have a recent due date, sorted by their due
 * date.
 */
export default function Dashboard() {
  const currentOrganization = useUserStore(state => state.currentOrganization);
  const currentOrganizationSummary = useUserStore(state => state.currentOrganizationSummary);
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

  const cards = () => {
    return (
      <>
        <ExpensesTotalCard
          expensesTotal={currentOrganizationSummary?.expensesTotal}
          changeSinceLastMonth={currentOrganizationSummary?.expensesTotalChangeSinceLastMonth} />
        <InvoicesTotalCard invoicesTotal={currentOrganizationSummary?.invoicesTotal}
                           changeSinceLastMonth={currentOrganizationSummary?.invoicesTotalChangeSinceLastMonth} />
        <SummaryCard value={currentOrganizationSummary?.numOfInvoices}
                     icon={<IconReceipt2 className={"text-default-500"} size={"20"} />} title={"Invoices"}
                     link={"/invoices"} linkText={"View Invoices"} />
        <SummaryCard value={currentOrganizationSummary?.numOfExpenses}
                     icon={<IconDevicesDollar className={"text-default-500"} size={"20"} />} title={"Expenses"}
                     link={"/expenses"} linkText={"View Expenses"} />
        <SummaryCard value={currentOrganizationSummary?.numOfMembers}
                     icon={<IconUsers className={"text-default-500"} size={"20"} />} title={"Members"}
                     link={"/members"} linkText={"View Members"} />
        <SummaryCard value={currentOrganizationSummary?.numOfVendors}
                     icon={<IconBuildingStore className={"text-default-500"} size={"20"} />} title={"Vendors"}
                     link={"/vendors"} linkText={"View Vendors"} />
      </>
    );
  };

  return (

    <div className="flex flex-col gap-4">
      <div className="flex flex-row flex-grow gap-4 p-2 flex-wrap md:p-10 md:flex-nowrap">
        <DashboardOrganizationForm currentOrganization={currentOrganization} />
        <div className="flex flex-col gap-4">
          <h1 className={"text-3xl font-bold"}>Overview</h1>
          <div className="flex flex-row gap-4 flex-wrap">
            <DashboardOrganizationContractsDue currentOrganization={currentOrganization}
                                               currentOrganizationContracts={contracts} />
            {currentOrganizationSummary && cards()}
          </div>
        </div>
      </div>
    </div>

  );

}

type DashboardOrganizationProps = {
  currentOrganization: Organization;
}

type DashboardOrganizationContractsDueProps = {
  currentOrganization: Organization,
  currentOrganizationContracts: Contract[],
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

export const DashboardOrganizationContractsDue = ({
                                                    currentOrganization,
                                                    currentOrganizationContracts
                                                  }: DashboardOrganizationContractsDueProps) => {

  const [isHovered, setIsHovered] = useState(false);

  const sortedContractsWithDueDate = currentOrganizationContracts.filter((contract) => contract.dueDate)
    .sort((a, b) => {
      if (a.dueDate && !b.dueDate) {
        return -1;
      } else if (!a.dueDate && b.dueDate) {
        return 1;
      } else if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      } else {
        return 0;
      }
    }).slice(0, 10);

  useEffect(() => {
    loadContracts(currentOrganization?.id);
  }, [currentOrganization?.id]);

  return (
    <Card>
      <CardHeader className={"px-4 py-2"}>
        <span className={"text-center font-bold"}>Upcoming Contracts</span>
      </CardHeader>
      <CardBody className={"px-4 py-2 flex flex-col gap-2"}>
        <Divider />
        {sortedContractsWithDueDate.length > 0 ?
          <ul>
            {sortedContractsWithDueDate.map((contract) => (
              <li key={contract.id}>
                <Button onMouseOver={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
                        variant={isHovered ? "flat" : "solid"} className={"text-center text-xs mb-5 w-full"}
                        startContent={<IconChartTreemap
                          className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />} as={NextLink}
                        href={"/contracts/" + contract?.id}>
                  <div>
                    {contract?.name && contract.name.charAt(0).toUpperCase() + contract.name.slice(1)}
                    <br />
                    {contract?.dueDate ? <span>Due Date: {new Date(contract?.dueDate)
                      .toLocaleString("en-CA", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        timeZone: "UTC"
                      })
                      .toLocaleUpperCase()}</span> : ""}
                  </div>
                </Button>
              </li>
            ))}
          </ul>
          :
          <p className={" text-sm text-center text-default-500"}>No contracts due soon.</p>
        }
      </CardBody>
      <CardFooter className={"px-4 py-2"}>
        <NextLink href={"/contracts"}>
          <span
            className={"text-xs font-md underline decoration-dotted underline-offset-2 text-default-500 hover:text-default-600"}>View all contracts</span>
        </NextLink>
      </CardFooter>
    </Card>
  );
};