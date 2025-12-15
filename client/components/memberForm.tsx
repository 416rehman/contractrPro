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
} from "@heroui/react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import {
  Icon123,
  IconAbc,
  IconChevronDown,
  IconDeviceFloppy,
  IconEdit,
  IconMail,
  IconPhone,
  IconTrash
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Button, ButtonGroup } from "@heroui/button";
import clsx from "clsx";
import { useUserStore } from "@/services/user";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
import OrganizationSelector from "@/components/organizationSelector";
import { Tooltip } from "@heroui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { useToastsStore } from "@/services/toast";
import { useRouter } from "next/navigation";
import { Member } from "@/types";

type Props = {
  id: string,
  className?: string,
}


/**
 * This is the main form for editing and or creating a member. The form receives the member id as a prop.
 * If the member id is undefined, the form will be in create mode. Otherwise, it will be in edit mode.
 * It handles communication with the API and updates the local state via the Member service.
 */
export default function MemberForm({ id, className }: Props) {
  const router = useRouter();
  const [member] = useMembersStore(state => [state.members.find((member: any) => member.id === id)]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState<any>(); // Save the edited member here
  const currentOrg = useUserStore(state => state.currentOrganization);
  const [isSaving, setIsSaving] = useState(false);
  const addToast = useToastsStore(state => state.addToast);


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
    setEditedMember({ ...editedMember!, [e.target.name]: e.target.value } as Member);
  };

  const onSaveHandler = async () => {
    // Save the edited member here
    setIsSaving(true);

    const newMember = await updateMemberAndPersist(editedMember!, currentOrg?.id);

    setIsEditing(!editedMember?.id);
    if (!editedMember?.id) {
      router.push(`/members/${newMember?.id}`);
    }

    setIsSaving(false);
  };

  const onDeleteHandler = async () => {
    if (editedMember?.UserId === currentOrg?.OwnerId) {
      return addToast({
        id: "delete-member",
        title: "Error",
        message: "You cannot delete the owner of the organization",
        type: "error"
      });
    }
    // Delete the member here
    setIsSaving(true);
    setIsEditing(false);
    await deleteMemberAndPersist(editedMember!, currentOrg?.id);
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
              <ModalBody>
                <p>Are you sure you want to delete this member?</p>
              </ModalBody>
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
                    <DropdownMenu disabledKeys={member?.UserId === currentOrg?.OwnerId ? ["delete"] : []}>
                      <DropdownItem key={"delete"}
                        description={member?.UserId === currentOrg?.OwnerId ? "Cannot delete the owner" : "Delete this member"}
                        onPress={onOpen}
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
              <Input label={"Name"} placeholder={"John Doe"} value={editedMember?.name} isReadOnly={!isEditing}
                type={"text"}
                startContent={<IconAbc className={"text-default-400"} size={"20"} />}
                name={"name"} onChange={onChangeHandler}
                variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <Input label={"Phone"} placeholder={"1-111-222-3333"} value={editedMember?.phone} isReadOnly={!isEditing}
                type={"text"}
                startContent={<IconPhone className={"text-default-400"} size={"20"} />}
                name={"phone"} onChange={onChangeHandler}
                variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <Input label={"Email"} placeholder={"johndoe@email.com"} value={editedMember?.email}
                isReadOnly={!isEditing}
                type={"email"}
                startContent={<IconMail className={"text-default-400"} size={"20"} />}
                name={"email"} onChange={onChangeHandler}
                variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
              <Input label={"Permissions"} placeholder={"5"} value={editedMember?.permissions} isReadOnly={!isEditing}
                type={"number"}
                startContent={<Icon123 className={"text-default-400"} size={"20"} />}
                name={"permissions"} onChange={onChangeHandler}
                variant={isEditing ? "flat" : "bordered"} labelPlacement={"outside"} />
            </form>
            <div className={"flex flex-col gap-1 items-start"}>
              {member?.updatedAt &&
                <Tooltip content={member?.updatedAt}>
                  <span className={"text-xs text-default-500"}>Updated {formatDistanceToNow(new Date(member?.updatedAt), { addSuffix: true })}</span>
                </Tooltip>
              }
              {member?.createdAt && (
                <Tooltip content={member?.createdAt}>
                  <span className={"text-xs text-default-500"}>Created {formatDistanceToNow(new Date(member?.createdAt), { addSuffix: true })}</span>
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
                  <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
                    className={"text-default-800 font-medium hover:bg-primary-200"}
                    endContent={<IconDeviceFloppy />}>
                    Save
                  </Button>
                </>
              ) : null}
              {/*  if no member Id this is a new member */}
              {!member?.id && (
                <Button variant={"flat"} onPress={onSaveHandler} isLoading={isSaving}
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