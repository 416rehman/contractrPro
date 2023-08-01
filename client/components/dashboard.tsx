"use client";

import { subtitle, title } from "@/components/primitives";
import { Spacer } from "@nextui-org/spacer";
import OrganizationSelector from "@/components/organizationSelector";
import React, { useEffect } from "react";
import { deleteOrganizationAndPersist, useUserStore } from "@/services/user";
import OrganizationForm from "@/components/organizationForm";
import { Divider } from "@nextui-org/divider";
import { Button, ButtonGroup } from "@nextui-org/button";
import { IconDotsVertical, IconPencil, IconPencilOff, IconTrash } from "@tabler/icons-react";
import { Tooltip } from "@nextui-org/tooltip";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import { Organization } from "@/types";
import { Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";

/**
 * The dashboard component. For now, it must display the current organization and allow the user to change and update it.
 */
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
      <DashboardOrganizationForm currentOrganization={currentOrganization} />
      <Divider orientation={"vertical"} className={"hidden md:block"} />
      <div className="flex flex-col gap-4">
        <h1 className={title()}>At a glance!</h1>
        {/*  More quick stats and links here, such as user assigned tasks, contracts due soon, etc. */}
      </div>
    </div>
  );
}

type DashboardOrganizationFormProps = {
  currentOrganization: Organization;
}
export const DashboardOrganizationForm = ({ currentOrganization }: DashboardOrganizationFormProps) => {
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