"use client";
import { deleteVendor, updateVendor, useVendorsStore } from "@/services/vendors";
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
import { IconChevronDown, IconDeviceFloppy, IconEdit, IconTrash } from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";
import VendorCommentSection from "@/components/vendorCommentSection";
import { Spacer } from "@nextui-org/spacer";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  className?: string;
}

/**
 * This is the main form for editing and or creating a vendor. The form receives the vendor id as a prop.
 * If the vendor id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Vendor service.
 */
export default function VendorForm({ id, className }: Props) {
  const router = useRouter();
  const [vendor] = useVendorsStore(state => [state.vendors.find((vendor: any) => vendor.id === id)]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVendor, setEditedVendor] = useState<any>(); // Save the edited vendor here
  const currentOrg = useUserStore(state => state.currentOrganization);
  const [isSaving, setIsSaving] = useState(false);

  // For delete modal dialog
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    setEditedVendor(vendor);
    setIsEditing(!vendor);
  }, [vendor]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedVendor({ ...editedVendor, [e.target.name]: e.target.value });
  };

  const onSaveHandler = async () => {
    // Save the edited vendor here
    setIsSaving(true);

    const newVendor = await updateVendor(editedVendor, currentOrg?.id);

    setIsEditing(!editedVendor?.id);
    if (!editedVendor?.id) {
      if (newVendor?.id) {
        router.push(`/vendors/${newVendor.id}`);
      }
    }

    setIsSaving(false);
  };

  const onDeleteHandler = async () => {
    // Delete the vendor here
    setIsSaving(true);
    setIsEditing(false);
    await deleteVendor(editedVendor, currentOrg?.id);
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
              <ModalHeader className="flex flex-col gap-1">Delete vendor</ModalHeader>
              <ModalBody> Are you sure you want to delete this vendor? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedVendor(undefined);
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
              <span className={"text-xs text-default-500"}>{editedVendor?.id}</span>
            </div>
            <div>
              {vendor?.id && (
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
                      <DropdownItem key={"delete"} description={"Delete this vendor"} onPress={onOpen}
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
              <Input label={"Name"} placeholder={"Name"} value={editedVendor?.name} isReadOnly={!isEditing}
                     type={"text"}
                     name={"name"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Phone"} placeholder={"Phone"} value={editedVendor?.phone} isReadOnly={!isEditing}
                     type={"text"} name={"phone"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Email"} placeholder={"Email"} value={editedVendor?.email} isReadOnly={!isEditing}
                     type={"email"} name={"email"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Website"} placeholder={"Website"} value={editedVendor?.website} isReadOnly={!isEditing}
                     type={"text"} name={"website"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Textarea label={"Description"} placeholder={"Description"} value={editedVendor?.description}
                        isReadOnly={!isEditing} name={"description"} onChange={onChangeHandler}
                        variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
            </form>
            <div className={"flex flex-col gap-1 items-start"}>
              {vendor?.updatedAt &&
                <Tooltip content={vendor?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {moment(vendor?.updatedAt).fromNow()}</span>
                </Tooltip>
              }
              {vendor?.createdAt && (
                <Tooltip content={vendor?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {moment(vendor?.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <div className={"flex gap-2 justify-between flex-grow"}>
              {isEditing && vendor?.id ? (
                <>
                  <Button variant={"light"} onPress={() => setIsEditing(false)} color={"danger"}
                          className={"font-medium hover:bg-danger-200"}>
                    Cancel
                  </Button>
                  <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
                          className={"text-default-800 font-medium hover:bg-primary-200"}
                          endContent={<IconDeviceFloppy />}>
                    Save
                  </Button>
                </>
              ) : null}
              {/*  if no vendor Id this is a new vendor */}
              {!vendor?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        endContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        {vendor?.id && (
          <VendorCommentSection vendor={vendor} />
        )}
        <Spacer y={10} />
      </div>
    </div>
  );
}