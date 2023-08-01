"use client";
import { deleteMemberAndPersist, updateMemberAndPersist, useMembersStore } from "@/services/members";
import {
  CardFooter,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure
} from "@nextui-org/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@nextui-org/button";
import { IconChevronDown, IconDeviceFloppy, IconEdit, IconTrash } from "@tabler/icons-react";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Tooltip } from "@nextui-org/tooltip";
import moment from "moment";

type Props = {
  id: string,
  className?: string,
}

/**
 * The MemberForm component renders a form for the user to input the name, phone, email, and permissions when creating an member for a selected organization
 * (otherwise it will prompt them to join or create one). When they click on the save button, the created member will be added to the members list in their account
 * for them to look at in its own page, showing two buttons beside it: Edit (lets them update the member's data) and Delete in a dropdown button (deletes the member's data with a
 * confirmation).
 */
export default function MemberForm({ id, className }: Props) {
  const [member] = useMembersStore(state => [state.members.find((member: any) => member.id === id)]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<any>(); // Save the edited member here
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
    setEditedMember(member);
    setIsEditing(!member);
  }, [member]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedMember({ ...editedMember, [e.target.name]: e.target.value });
  };

  const onSaveHandler = async () => {
    // Save the edited member here
    setIsSaving(true);

    await updateMemberAndPersist(editedMember, currentOrg?.id);

    setIsEditing(!editedMember?.id);
    if (!editedMember?.id) {
      setEditedMember(undefined);
    }

    setIsSaving(false);
  };

  const onDeleteHandler = async () => {
    // Delete the member here
    setIsSaving(true);
    setIsEditing(false);
    await deleteMemberAndPersist(editedMember, currentOrg?.id);
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
              <ModalHeader className="flex flex-col gap-1">Delete member</ModalHeader>
              <ModalBody> Are you sure you want to delete this member? </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="danger" onPress={() => {
                  onDeleteHandler();
                  onClose();
                  setEditedMember(undefined);
                }}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className={"flex justify-center w-full"}>
        <Card shadow={"none"} className={"border-none w-full"}>
          <CardHeader className={"flex gap-2"}>
            <div className={"flex-grow flex italic flex-col gap-1 items-start"}>
              <span className={"text-xs text-default-500"}>{currentOrg?.id}</span>
              <span className={"text-xs text-default-500"}>{editedMember?.id}</span>
            </div>
            <div>
              {member?.id && (
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
                      <DropdownItem key={"delete"} description={"Delete this member"} onPress={onOpen}
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
              <Input label={"Name"} placeholder={"Name"} value={editedMember?.name} isReadOnly={!isEditing}
                     type={"text"}
                     name={"name"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Phone"} placeholder={"Phone"} value={editedMember?.phone} isReadOnly={!isEditing}
                     type={"text"} name={"phone"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Email"} placeholder={"Email"} value={editedMember?.email} isReadOnly={!isEditing}
                     type={"email"} name={"email"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
              <Input label={"Permissions"} placeholder={"Permissions"} value={editedMember?.permissions}
                     isReadOnly={!isEditing} type={"number"} name={"permissions"} onChange={onChangeHandler}
                     variant={isEditing ? "flat" : "underlined"} labelPlacement={"outside"} />
            </form>
            <div className={"flex flex-col gap-1 items-start"}>
              {member?.updatedAt &&
                <Tooltip content={member?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {moment(member?.updatedAt).fromNow()}</span>
                </Tooltip>
              }
              {member?.createdAt && (
                <Tooltip content={member?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {moment(member?.createdAt).fromNow()}</span>
                </Tooltip>
              )}
            </div>
          </CardBody>
          <CardFooter>
            <div className={"flex gap-2 justify-between flex-grow"}>
              {isEditing && member?.id ? (
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
              {/*  if no member Id this is a new member */}
              {!member?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} loading={isSaving}
                        className={"text-default-800 font-medium hover:bg-primary-200"}
                        endContent={<IconDeviceFloppy />}>
                  Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );


}