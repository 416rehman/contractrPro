"use client";
import { deleteClient, updateClient, useClientsStore } from "@/services/clients";
import {
  CardFooter,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure
} from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import { IconAbc, IconAppWindow, IconChevronDown, IconDeviceFloppy, IconEdit, IconMail, IconPhone, IconTrash } from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";
import { Spacer } from "@nextui-org/spacer";
import ClientCommentSection from "@/components/clientCommentSection";

type Props = {
  id: string;
  className?: string;
}

/**
 * This is the main form for editing and or creating a client. The form receives the client id as a prop.
 * If the client id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Client service.
 */
export default function ClientForm({ id, className }: Props) {
  const [client] = useClientsStore(state => [state.clients.find((client: any) => client.id === id)]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<any>(); // Save the edited client here
  const currentOrg = useUserStore(state => state.currentOrganization);
  const [isSaving, setIsSaving] = useState(false);


  // Confirm reload if editing
  useEffect(() => {
    if (isEditing) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }
  }, [isEditing]);

  // For delete modal dialog
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    setEditedClient(client);
    setIsEditing(!client);
  }, [client]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedClient({ ...editedClient, [e.target.name]: e.target.value });
  };

  const onSaveHandler = async () => {
    // Save the edited client here
    setIsSaving(true);

    await updateClient(editedClient, currentOrg?.id);

    setIsEditing(!editedClient?.id);
    if (!editedClient?.id) {
      setEditedClient(undefined);
    }

    setIsSaving(false);
  };

  const onDeleteHandler = async () => {
    // Delete the client here
    setIsSaving(true);
    setIsEditing(false);
    await deleteClient(editedClient, currentOrg?.id);
    setIsSaving(false);
  };

  if (!currentOrg) {
    return <div className={clsx("flex flex-col flex-grow w-full", className)}>
      <div className={"flex justify-center w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2 justify-center flex-col"}>
            <p className={"text-xl"}>Please select an organization</p>
            <OrganizationSelector hideActions={true} />
          </CardHeader>
        </Card>
      </div>
    </div>;
  }

  return (
    <div className={clsx("flex flex-col flex-grow w-full", className)}>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} backdrop={"opaque"}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete client</ModalHeader>
              <ModalBody> Are you sure you want to delete this client? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedClient(undefined);
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex flex-col justify-center w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2"}>
            <div className={"flex-grow flex italic flex-col gap-1 items-start"}>
              <span className={"text-xs text-default-500"}>{currentOrg?.id}</span>
              <span className={"text-xs text-default-500"}>{editedClient?.id}</span>
            </div>
            <div>
              {client?.id && (
                <ButtonGroup variant="flat" size={"sm"} color={"default"}>
                  <Button endContent={<IconEdit />}
                          onPress={() => setIsEditing(true)}
                          isDisabled={isEditing}>
                    Edit
                  </Button>
                  <Dropdown placement="bottom-start">
                    <DropdownTrigger>
                      <Button isIconOnly>
                        <IconChevronDown />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem key={"delete"} description={"Delete this client"} onPress={onOpen}
                                    startContent={<IconTrash className={"text-default-500"} />} shortcut={"D"}>
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </ButtonGroup>
              )}
            </div>
          </CardHeader>
          <CardBody className={"flex flex-col gap-4"}>
            <form className={clsx("flex flex-col gap-4", { "pointer-events-none": !isEditing })}>
              <Input label={"Name"} placeholder={"Name"} value={editedClient?.name} isReadOnly={!isEditing}
                     type={"text"}
                     startContent={<IconAbc className={"text-default-400"} size={"20"} />} 
                     name={"name"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Phone"} placeholder={"Phone"} value={editedClient?.phone} isReadOnly={!isEditing}
                     type={"text"} 
                     startContent={<IconPhone className={"text-default-400"} size={"20"} />}
                     name={"phone"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Email"} placeholder={"Email"} value={editedClient?.email} isReadOnly={!isEditing}
                     type={"email"} 
                     startContent={<IconMail className={"text-default-400"} size={"20"} />}
                     name={"email"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Website"} placeholder={"Website"} value={editedClient?.website} isReadOnly={!isEditing}
                     type={"text"} 
                     startContent={<IconAppWindow className={"text-default-400"} size={"20"} />}
                     name={"website"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Textarea label={"Description"} placeholder={"Description"} value={editedClient?.description}
                        isReadOnly={!isEditing} name={"description"} onChange={onChangeHandler}
                        variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
            </form>
            <div className={"flex flex-col gap-1 items-start"}>
              {client?.updatedAt &&
                <Tooltip content={client?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {moment(client?.updatedAt).fromNow()}</span>
                </Tooltip>
              }
              {client?.createdAt && (
                <Tooltip content={client?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {moment(client?.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <div className={"flex gap-2 justify-between flex-grow"}>
              {isEditing && client?.id ? (
                <>
                  <Button variant={"light"} onPress={() => setIsEditing(false)} color={"danger"}
                          className={"font-medium hover:bg-danger-200"}>
                    Cancel
                  </Button>
                  <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                          className={"text-default-800 font-medium hover:bg-primary-200"}
                          endContent={<IconDeviceFloppy />}>
                    Save
                  </Button>
                </>
              ) : null}
              {/*  if no client Id this is a new client */}
              {!client?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        endContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        {client?.id && (
          <ClientCommentSection client={client} />
        )}
        <Spacer y={10} />
      </div>
    </div>
  );
}